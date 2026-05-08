import json
import logging
import re
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Any
from zipfile import ZipFile
from xml.etree import ElementTree

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api import deps
from app.models.user import User
from app.services.llm_service import llm_service

router = APIRouter()
logger = logging.getLogger("app.routes.resume")

MAX_RESUME_BYTES = 5 * 1024 * 1024
MAX_TEXT_CHARS = 18000
SUPPORTED_EXTENSIONS = {"pdf", "docx"}


def _empty_resume_data() -> dict[str, Any]:
    return {
        "personalInfo": {
            "fullName": "",
            "location": "",
            "phone": "",
            "email": "",
            "linkedin": "",
            "github": "",
        },
        "summary": "",
        "skills": [],
        "experience": [],
        "projects": [],
        "education": [],
        "achievements": [],
        "certifications": [],
        "languages": [],
        "interests": [],
        "volunteerExperience": [],
        "customSections": [],
        "sectionVisibility": {
            "summary": False,
            "skills": False,
            "experience": False,
            "projects": False,
            "education": False,
            "achievements": False,
            "certifications": False,
            "languages": False,
            "interests": False,
            "volunteerExperience": False,
        },
    }


def _as_string(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def _as_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [_as_string(item) for item in value if _as_string(item)]


def _as_comma_text(value: Any) -> str:
    if isinstance(value, list):
        return ", ".join(_as_string(item) for item in value if _as_string(item))
    return _as_string(value)


def _as_bullets(value: Any) -> list[str]:
    if isinstance(value, str):
        return [line.strip(" -\t") for line in value.splitlines() if line.strip(" -\t")]
    return _as_string_list(value)


def _get_first_present(data: dict[str, Any], keys: list[str]) -> Any:
    for key in keys:
        value = data.get(key)
        if value:
            return value
    return None


def _normalize_skills(value: Any) -> list[dict[str, str]]:
    if not value:
        return []

    if isinstance(value, dict):
        normalized = []
        for category, items in value.items():
            category_text = _as_string(category)
            items_text = _as_comma_text(items)
            if category_text or items_text:
                normalized.append({
                    "category": category_text or "Skills",
                    "items": items_text,
                })
        return normalized

    if isinstance(value, str):
        return [{"category": "Skills", "items": value.strip()}] if value.strip() else []

    if not isinstance(value, list):
        return []

    normalized = []
    loose_items = []
    for item in value:
        if isinstance(item, str):
            if item.strip():
                loose_items.append(item.strip())
            continue

        if not isinstance(item, dict):
            continue

        category = _as_string(
            item.get("category")
            or item.get("name")
            or item.get("type")
            or item.get("section")
            or item.get("title")
        )
        items = _as_comma_text(
            item.get("items")
            or item.get("skills")
            or item.get("technologies")
            or item.get("tools")
            or item.get("keywords")
            or item.get("values")
        )

        if category or items:
            normalized.append({
                "category": category or "Skills",
                "items": items,
            })

    if loose_items:
        normalized.append({"category": "Skills", "items": ", ".join(loose_items)})

    return normalized


def _is_skills_section_title(title: str) -> bool:
    normalized = title.lower()
    return any(keyword in normalized for keyword in ("skill", "technical", "technology", "tool"))


def _normalize_resume_data(data: Any) -> dict[str, Any]:
    base = _empty_resume_data()
    if not isinstance(data, dict):
        return base

    personal = data.get("personalInfo") if isinstance(data.get("personalInfo"), dict) else {}
    base["personalInfo"] = {
        key: _as_string(personal.get(key))
        for key in base["personalInfo"]
    }
    base["summary"] = _as_string(data.get("summary"))

    base["skills"] = _normalize_skills(_get_first_present(data, [
        "skills",
        "technicalSkills",
        "technical_skills",
        "coreSkills",
        "core_skills",
        "technologies",
        "tools",
    ]))

    if isinstance(data.get("experience"), list):
        base["experience"] = [
            {
                "role": _as_string(item.get("role")),
                "company": _as_string(item.get("company")),
                "location": _as_string(item.get("location")),
                "period": _as_string(item.get("period")),
                "description": _as_bullets(item.get("description")),
            }
            for item in data["experience"]
            if isinstance(item, dict) and (_as_string(item.get("role")) or _as_string(item.get("company")))
        ]

    if isinstance(data.get("projects"), list):
        base["projects"] = [
            {
                "title": _as_string(item.get("title")),
                "techStack": _as_string(item.get("techStack")),
                "description": _as_bullets(item.get("description")),
            }
            for item in data["projects"]
            if isinstance(item, dict) and (_as_string(item.get("title")) or _as_string(item.get("techStack")))
        ]

    if isinstance(data.get("education"), list):
        base["education"] = [
            {
                "degree": _as_string(item.get("degree")),
                "institution": _as_string(item.get("institution")),
                "location": _as_string(item.get("location")),
                "period": _as_string(item.get("period")),
            }
            for item in data["education"]
            if isinstance(item, dict) and (_as_string(item.get("degree")) or _as_string(item.get("institution")))
        ]

    base["achievements"] = _as_string_list(data.get("achievements"))
    base["languages"] = _as_string_list(data.get("languages"))
    base["interests"] = _as_string_list(data.get("interests"))

    if isinstance(data.get("certifications"), list):
        base["certifications"] = [
            {
                "name": _as_string(item.get("name")),
                "issuer": _as_string(item.get("issuer")),
                "date": _as_string(item.get("date")),
                "details": _as_string(item.get("details")),
            }
            for item in data["certifications"]
            if isinstance(item, dict) and (_as_string(item.get("name")) or _as_string(item.get("issuer")))
        ]

    if isinstance(data.get("volunteerExperience"), list):
        base["volunteerExperience"] = [
            {
                "role": _as_string(item.get("role")),
                "organization": _as_string(item.get("organization")),
                "location": _as_string(item.get("location")),
                "period": _as_string(item.get("period")),
                "description": _as_string(item.get("description")),
            }
            for item in data["volunteerExperience"]
            if isinstance(item, dict) and (_as_string(item.get("role")) or _as_string(item.get("organization")))
        ]

    if isinstance(data.get("customSections"), list):
        custom_sections = []
        for index, item in enumerate(data["customSections"]):
            if not isinstance(item, dict):
                continue
            title = _as_string(item.get("title"))
            items = _as_string_list(item.get("items"))
            if title or items:
                if _is_skills_section_title(title):
                    base["skills"].append({
                        "category": title or "Skills",
                        "items": ", ".join(items),
                    })
                    continue

                custom_sections.append({
                    "id": _as_string(item.get("id")) or f"imported-section-{index + 1}",
                    "title": title or "Additional Information",
                    "items": items,
                })
        base["customSections"] = custom_sections

    base["sectionVisibility"] = {
        "summary": bool(base["summary"]),
        "skills": bool(base["skills"]),
        "experience": bool(base["experience"]),
        "projects": bool(base["projects"]),
        "education": bool(base["education"]),
        "achievements": bool(base["achievements"]),
        "certifications": bool(base["certifications"]),
        "languages": bool(base["languages"]),
        "interests": bool(base["interests"]),
        "volunteerExperience": bool(base["volunteerExperience"]),
    }
    return base


def _extract_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, flags=re.DOTALL)
    if fence_match:
        cleaned = fence_match.group(1)
    else:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start:end + 1]

    parsed = json.loads(cleaned)
    if not isinstance(parsed, dict):
        raise ValueError("LLM response was not a JSON object")
    return parsed


def _docx_paragraph_text(paragraph: ElementTree.Element, namespace: str) -> str:
    parts = []
    for node in paragraph.iter():
        if node.tag == f"{namespace}t" and node.text:
            parts.append(node.text)
        elif node.tag == f"{namespace}tab":
            parts.append("\t")
        elif node.tag == f"{namespace}br":
            parts.append("\n")
    return "".join(parts).strip()


def _docx_table_text(table: ElementTree.Element, namespace: str) -> str:
    rows = []
    for row in table.iter(f"{namespace}tr"):
        cells = []
        for cell in row.findall(f"{namespace}tc"):
            paragraphs = [
                _docx_paragraph_text(paragraph, namespace)
                for paragraph in cell.findall(f"{namespace}p")
            ]
            cell_text = " ".join(part for part in paragraphs if part).strip()
            if cell_text:
                cells.append(cell_text)
        if cells:
            rows.append(" | ".join(cells))
    return "\n".join(rows)


def _extract_docx_text(content: bytes) -> str:
    try:
        with ZipFile(BytesIO(content)) as docx:
            xml = docx.read("word/document.xml")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to read the DOCX resume.") from exc

    root = ElementTree.fromstring(xml)
    namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    body = root.find(f"{namespace}body")
    if body is None:
        return ""

    blocks = []
    for child in body:
        if child.tag == f"{namespace}p":
            text = _docx_paragraph_text(child, namespace)
            if text:
                blocks.append(text)
        elif child.tag == f"{namespace}tbl":
            text = _docx_table_text(child, namespace)
            if text:
                blocks.append(text)

    return "\n".join(blocks)


def _extract_pdf_text(content: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise HTTPException(status_code=500, detail="PDF parsing dependency is not installed.") from exc

    try:
        reader = PdfReader(BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to read the PDF resume.") from exc

    return "\n".join(pages)


def _resume_prompt_rules() -> str:
    return """
Rules:
- Return JSON only. No markdown, no explanation.
- Preserve real candidate wording when possible.
- Use empty strings or empty arrays for missing data.
- Split work and project descriptions into concise bullet arrays.
- Job title belongs in experience.role. Company belongs in experience.company.
- Employment date ranges such as "Jan 2022 - Present" belong in experience.period.
- Education date ranges belong in education.period.
- Project frameworks, languages, tools, and libraries belong in projects.techStack.
- Technical skills must go in skills as an array of objects: {"category": "Languages", "items": "Python, JavaScript"}.
- Do not put technical skills, tools, frameworks, languages, or technologies in customSections.
- If a date is visually aligned near a role, company, degree, or project, attach it to that item.
- Put unrelated sections that do not fit the schema into customSections.
- Set sectionVisibility true only when that section has useful content.
""".strip()


def _build_text_resume_prompt(resume_text: str) -> str:
    schema = json.dumps(_empty_resume_data(), indent=2)
    return f"""
You are an expert resume parser for a resume builder application.
Extract the candidate resume into the exact JSON shape below.

{_resume_prompt_rules()}

JSON shape:
{schema}

Resume text extracted from DOCX. Lines separated by "|" came from table cells and may represent columns from the same resume row:
{resume_text[:MAX_TEXT_CHARS]}
""".strip()


def _build_pdf_resume_prompt() -> str:
    schema = json.dumps(_empty_resume_data(), indent=2)
    return f"""
You are an expert resume parser for a resume builder application.
Read the uploaded PDF directly, including layout, columns, right-aligned dates, headings, and visual grouping.
Extract the candidate resume into the exact JSON shape below.

{_resume_prompt_rules()}

JSON shape:
{schema}
""".strip()


async def _parse_resume_with_pdf(content: bytes, filename: str | None) -> str:
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        return await llm_service.generate_response_from_pdf(
            _build_pdf_resume_prompt(),
            temp_path,
            display_name=filename or "resume.pdf",
        )
    finally:
        if temp_path:
            try:
                Path(temp_path).unlink(missing_ok=True)
            except Exception as exc:
                logger.warning("Failed to delete temporary resume PDF: %s", exc)


async def _parse_resume_with_text(content: bytes, extension: str) -> str:
    if extension == "pdf":
        resume_text = _extract_pdf_text(content)
    else:
        resume_text = _extract_docx_text(content)

    resume_text = re.sub(r"\n{3,}", "\n\n", resume_text).strip()
    if len(resume_text) < 40:
        raise HTTPException(status_code=400, detail="We could not extract enough readable text from this resume.")

    return await llm_service.generate_response(_build_text_resume_prompt(resume_text))


@router.post("/import", response_model=dict)
async def import_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    extension = (file.filename or "").lower().rsplit(".", 1)[-1]
    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a PDF or DOCX resume.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded resume is empty.")
    if len(content) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=413, detail="Resume file must be 5 MB or smaller.")

    if extension == "pdf":
        try:
            ai_response = await _parse_resume_with_pdf(content, file.filename)
        except Exception:
            logger.exception("PDF document parsing failed, falling back to text extraction")
            ai_response = await _parse_resume_with_text(content, extension)
    else:
        ai_response = await _parse_resume_with_text(content, extension)

    try:
        parsed = _extract_json_object(ai_response)
    except Exception as exc:
        logger.exception("Resume import JSON parsing failed")
        raise HTTPException(status_code=502, detail="The resume parser could not structure this file. Please try again.") from exc

    return {
        "data": _normalize_resume_data(parsed),
        "source": {
            "filename": file.filename,
            "contentType": file.content_type,
        },
    }
