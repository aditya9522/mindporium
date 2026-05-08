import json
import logging
import re
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api import deps
from app.models.user import User
from app.services.llm_service import llm_service

router = APIRouter()
logger = logging.getLogger("app.routes.career_tools")


class JobMatchedResumeRequest(BaseModel):
    resume_data: dict[str, Any] = Field(default_factory=dict)
    job_description: str = Field(min_length=30)
    target_role: str = ""


class InterviewStartRequest(BaseModel):
    resume_data: dict[str, Any] = Field(default_factory=dict)
    target_role: str = Field(min_length=2)
    job_description: str = ""
    difficulty: str = "mid"


class InterviewFeedbackRequest(BaseModel):
    question: str = Field(min_length=5)
    answer: str = Field(min_length=5)
    target_role: str = Field(min_length=2)
    resume_data: dict[str, Any] = Field(default_factory=dict)


class PortfolioRequest(BaseModel):
    resume_data: dict[str, Any] = Field(default_factory=dict)
    headline: str = ""
    portfolio_goal: str = ""


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


async def _generate_json(prompt: str) -> dict[str, Any]:
    response = await llm_service.generate_response(prompt)
    try:
        return _extract_json_object(response)
    except Exception as exc:
        logger.exception("Career tool JSON parsing failed")
        raise HTTPException(status_code=502, detail="AI response could not be structured. Please try again.") from exc


@router.post("/job-match-resume", response_model=dict)
async def generate_job_matched_resume(
    payload: JobMatchedResumeRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    schema = {
        "matchScore": 0,
        "targetRole": "",
        "missingKeywords": [],
        "strongKeywords": [],
        "rewriteNotes": [],
        "tailoredResumeData": {},
    }
    prompt = f"""
You are an expert resume strategist.
Tailor the provided resume JSON for the target job description.

Return JSON only using this shape:
{json.dumps(schema, indent=2)}

Rules:
- Keep the same resume JSON shape in tailoredResumeData.
- Preserve truthfulness. Do not invent jobs, degrees, employers, dates, or credentials.
- Improve summary and bullet wording using evidence already in the resume.
- Emphasize relevant projects, skills, and experience for the job.
- Put missing job keywords in missingKeywords only when absent from the resume.
- matchScore is 0-100 based on how well the resume matches the job.

Target role:
{payload.target_role}

Job description:
{payload.job_description[:8000]}

Resume JSON:
{json.dumps(payload.resume_data)[:14000]}
""".strip()
    return await _generate_json(prompt)


@router.post("/interview/questions", response_model=dict)
async def generate_interview_questions(
    payload: InterviewStartRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    schema = {
        "interviewTitle": "",
        "focusAreas": [],
        "questions": [
            {
                "id": "q1",
                "type": "behavioral|technical|project|resume",
                "question": "",
                "whatGoodLooksLike": "",
            }
        ],
    }
    prompt = f"""
You are a senior interviewer creating a realistic mock interview.
Return JSON only using this shape:
{json.dumps(schema, indent=2)}

Rules:
- Generate 8 questions.
- Mix behavioral, technical, project, and resume-specific questions.
- Use the target role, job description, and resume details.
- whatGoodLooksLike must be concise and useful for self-practice.

Target role: {payload.target_role}
Difficulty: {payload.difficulty}
Job description:
{payload.job_description[:6000]}

Resume JSON:
{json.dumps(payload.resume_data)[:12000]}
""".strip()
    return await _generate_json(prompt)


@router.post("/interview/feedback", response_model=dict)
async def generate_interview_feedback(
    payload: InterviewFeedbackRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    schema = {
        "score": 0,
        "verdict": "",
        "strengths": [],
        "improvements": [],
        "betterAnswer": "",
        "followUpQuestion": "",
    }
    prompt = f"""
You are an interview coach.
Assess the user's answer for the target role and return JSON only:
{json.dumps(schema, indent=2)}

Rules:
- score is 0-100.
- Give specific feedback.
- betterAnswer should be a polished answer the user can learn from.
- Do not invent resume facts.

Target role: {payload.target_role}
Question: {payload.question}
User answer: {payload.answer}
Resume JSON:
{json.dumps(payload.resume_data)[:10000]}
""".strip()
    return await _generate_json(prompt)


@router.post("/portfolio", response_model=dict)
async def generate_portfolio(
    payload: PortfolioRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    schema = {
        "hero": {
            "name": "",
            "headline": "",
            "summary": "",
            "ctaText": "",
        },
        "skills": [],
        "featuredProjects": [
            {
                "title": "",
                "techStack": "",
                "description": "",
                "highlights": [],
            }
        ],
        "experienceHighlights": [],
        "education": [],
        "achievements": [],
        "contact": {
            "email": "",
            "linkedin": "",
            "github": "",
            "location": "",
        },
    }
    prompt = f"""
You are a portfolio strategist.
Convert the resume JSON into a polished portfolio content plan.
Return JSON only using this shape:
{json.dumps(schema, indent=2)}

Rules:
- Preserve truthfulness. Do not invent links, employers, degrees, or project outcomes.
- Make the content concise, professional, and web-ready.
- Use portfolio_goal to decide what to emphasize.
- Flatten skill categories into readable strings in skills.

Preferred headline:
{payload.headline}

Portfolio goal:
{payload.portfolio_goal}

Resume JSON:
{json.dumps(payload.resume_data)[:14000]}
""".strip()
    return await _generate_json(prompt)
