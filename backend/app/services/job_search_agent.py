import re
from dataclasses import dataclass
from datetime import datetime, timezone
from html import unescape
from urllib.parse import parse_qs, quote_plus, unquote, urlparse
from urllib.request import Request, urlopen


@dataclass(frozen=True)
class JobSearchCriteria:
    query: str
    location: str = ""
    remote: bool = False
    experience: str = "any"


class JobSearchAgent:
    """Finds current public job openings and normalizes them for the app."""

    def __init__(self, timeout_seconds: int = 12, max_results: int = 12) -> None:
        self.timeout_seconds = timeout_seconds
        self.max_results = max_results

    def search(self, criteria: JobSearchCriteria) -> dict:
        jobs: list[dict[str, str]] = []
        seen: set[str] = set()
        for search_url in self._build_search_urls(criteria):
            html = self._read_text_url(search_url)
            for job in self._extract_jobs(html, criteria):
                if job["url"] in seen:
                    continue
                jobs.append(job)
                seen.add(job["url"])
                if len(jobs) >= self.max_results:
                    break
            if len(jobs) >= self.max_results:
                break

        return {
            "query": criteria.query,
            "location": criteria.location,
            "experience": criteria.experience,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "jobs": jobs,
        }

    def _build_search_urls(self, criteria: JobSearchCriteria) -> list[str]:
        base_terms = [criteria.query.strip(), "hiring OR vacancy OR careers"]
        scoped_terms = [*base_terms]
        if criteria.location.strip():
            scoped_terms.append(criteria.location.strip())
        if criteria.remote:
            scoped_terms.append("remote")
        if criteria.experience != "any":
            scoped_terms.append(criteria.experience.replace("-", " "))

        queries = [
            [*scoped_terms, "-course -training"],
            [*base_terms, criteria.location.strip(), "-course -training"] if criteria.location.strip() else [*base_terms, "-course -training"],
            [criteria.query.strip(), "jobs", "apply", "-course -training"],
        ]

        deduped_queries = []
        for query in queries:
            cleaned = [term for term in query if term]
            if cleaned not in deduped_queries:
                deduped_queries.append(cleaned)

        return [f"https://duckduckgo.com/html/?q={quote_plus(' '.join(query))}" for query in deduped_queries]

    def _read_text_url(self, url: str) -> str:
        request = Request(
            url,
            headers={
                "User-Agent": "MindporiumJobSearchAgent/1.0",
                "Accept": "text/html,application/xhtml+xml",
            },
        )
        with urlopen(request, timeout=self.timeout_seconds) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            return response.read().decode(charset, errors="replace")

    def _extract_jobs(self, html: str, criteria: JobSearchCriteria) -> list[dict[str, str]]:
        matches = list(re.finditer(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html, flags=re.DOTALL))
        jobs: list[dict[str, str]] = []
        seen: set[str] = set()

        for index, match in enumerate(matches):
            url = self._decode_result_url(unescape(match.group(1)))
            if not url.startswith("http") or url in seen:
                continue

            title = self._clean_html(match.group(2))
            next_start = matches[index + 1].start() if index + 1 < len(matches) else len(html)
            result_fragment = html[match.end():next_start]
            snippet_match = re.search(r'class="result__snippet"[^>]*>(.*?)</a>', result_fragment, flags=re.DOTALL)
            snippet = self._clean_html(snippet_match.group(1)) if snippet_match else ""
            if not self._looks_like_job(title, snippet, criteria.query):
                continue

            domain = urlparse(url).netloc.replace("www.", "")
            jobs.append(
                {
                    "id": f"{domain}-{len(jobs)}",
                    "title": title,
                    "company": self._company_from_domain(domain),
                    "location": criteria.location or ("Remote" if criteria.remote else "See posting"),
                    "source": domain,
                    "url": url,
                    "summary": snippet or "Open the source posting for full role details, requirements, and application steps.",
                }
            )
            seen.add(url)
            if len(jobs) >= self.max_results:
                break

        return jobs

    @staticmethod
    def _decode_result_url(href: str) -> str:
        if href.startswith("//"):
            href = f"https:{href}"
        parsed = urlparse(href)
        if "duckduckgo.com" in parsed.netloc and parsed.path.startswith("/l/"):
            uddg = parse_qs(parsed.query).get("uddg")
            if uddg:
                return unquote(uddg[0])
        return href

    @staticmethod
    def _clean_html(value: str) -> str:
        text = re.sub(r"<[^>]+>", " ", value)
        text = unescape(text)
        return re.sub(r"\s+", " ", text).strip()

    @staticmethod
    def _company_from_domain(domain: str) -> str:
        name = domain.split(".")[0].replace("-", " ").strip()
        return name.title() if name else "Company"

    @staticmethod
    def _looks_like_job(title: str, snippet: str, query: str) -> bool:
        haystack = f"{title} {snippet}".lower()
        role_tokens = [token for token in re.split(r"[^a-z0-9+#.]+", query.lower()) if len(token) >= 2]
        hiring_terms = ("job", "jobs", "career", "careers", "hiring", "vacancy", "opening", "apply")
        has_role_match = any(token in haystack for token in role_tokens)
        has_hiring_signal = any(term in haystack for term in hiring_terms)
        return bool(title) and has_role_match and has_hiring_signal


job_search_agent = JobSearchAgent()
