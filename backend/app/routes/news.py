import asyncio
from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.api import deps
from app.core.config import settings
from app.models.user import User

router = APIRouter()

NEWSAPI_BASE_URL = "https://newsapi.org/v2"
DEFAULT_NEWS_IMAGE = (
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
    "?w=800&auto=format&fit=crop&q=60"
)


class NewsArticle(BaseModel):
    id: int
    title: str
    summary: str
    url: str
    source: str
    published_at: str
    image_url: Optional[str] = None
    technology: Optional[str] = "Technology"


class NewsFeedResponse(BaseModel):
    articles: List[NewsArticle]
    page: int
    page_size: int
    total_results: int
    has_more: bool
    category: str
    interest: Optional[str] = None


def _request_newsapi(endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
    if not settings.NEWSAPI_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="News service is not configured. Please set NEWSAPI_KEY.",
        )

    query = urlencode({key: value for key, value in params.items() if value is not None})
    request = Request(
        f"{NEWSAPI_BASE_URL}/{endpoint}?{query}",
        headers={
            "X-Api-Key": settings.NEWSAPI_KEY,
            "User-Agent": f"{settings.APP_NAME}/1.0",
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        message = "Unable to fetch news right now."
        try:
            error_body = json.loads(exc.read().decode("utf-8"))
            message = error_body.get("message", message)
        except Exception:
            pass
        raise HTTPException(status_code=exc.code, detail=message)
    except URLError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="News service is temporarily unreachable.",
        )


def _format_article(article: Dict[str, Any], index: int, technology: str = "Technology") -> Optional[NewsArticle]:
    title = article.get("title")
    url = article.get("url")
    if not title or not url or title == "[Removed]":
        return None

    source = article.get("source") or {}
    published_at = article.get("publishedAt") or datetime.now(timezone.utc).isoformat()

    return NewsArticle(
        id=index + 1,
        title=title,
        summary=article.get("description")
        or article.get("content")
        or "Read the full article for more details.",
        url=url,
        source=source.get("name") or "NewsAPI",
        published_at=published_at,
        image_url=article.get("urlToImage") or DEFAULT_NEWS_IMAGE,
        technology=technology,
    )


@router.get("/", response_model=NewsFeedResponse)
async def get_latest_news(
    q: Optional[str] = Query(
        None,
        min_length=2,
        max_length=100,
        description="Optional keyword search. Uses NewsAPI's /everything endpoint.",
    ),
    category: str = Query(
        "technology",
        pattern="^(technology|business|science|health|general|entertainment|sports)$",
        description="NewsAPI top-headlines category when no keyword/interest is provided.",
    ),
    interest: Optional[str] = Query(
        None,
        min_length=2,
        max_length=80,
        description="Professional interest filter such as AI, cybersecurity, startups, cloud, or data science.",
    ),
    page: int = Query(1, ge=1, le=100),
    page_size: int = Query(12, ge=1, le=50),
    _current_user: User = Depends(deps.get_current_active_user),
):
    """
    Return authenticated tech news.

    Defaults to NewsAPI top technology headlines, which is the best fit for the
    application's latest-news feed. When a keyword is provided, use /everything
    because NewsAPI recommends it for article discovery and search.
    """
    search_term = (q or interest or "").strip()
    if search_term:
        response = await asyncio.to_thread(
            _request_newsapi,
            "everything",
            {
                "q": search_term,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": page_size,
                "page": page,
            },
        )
    else:
        response = await asyncio.to_thread(
            _request_newsapi,
            "top-headlines",
            {
                "country": "us",
                "category": category,
                "pageSize": page_size,
                "page": page,
            },
        )

    if response.get("status") != "ok":
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=response.get("message", "NewsAPI returned an error."),
        )

    total_results = min(int(response.get("totalResults") or 0), 100)
    technology_label = interest or q or category.title()
    articles = [
        formatted
        for index, article in enumerate(response.get("articles", []), start=(page - 1) * page_size)
        if (formatted := _format_article(article, index, technology_label)) is not None
    ]
    return NewsFeedResponse(
        articles=articles,
        page=page,
        page_size=page_size,
        total_results=total_results,
        has_more=(page * page_size) < total_results and bool(articles),
        category=category,
        interest=interest,
    )
