from fastapi import APIRouter, HTTPException
import urllib.request
import xml.etree.ElementTree as ET
import asyncio
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import re

router = APIRouter()

class NewsArticle(BaseModel):
    id: int
    title: str
    summary: str
    url: str
    source: str
    published_at: str
    image_url: Optional[str] = None
    technology: Optional[str] = "Tech"

def fetch_rss_feed(url: str, source_name: str) -> List[dict]:
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        articles = []
        
        # Parse standard RSS 2.0
        for i, item in enumerate(root.findall('.//item')):
            if i >= 10:  # Limit amount per feed
                break
                
            title = item.findtext('title') or 'No Title'
            link = item.findtext('link') or '#'
            pub_date = item.findtext('pubDate') or datetime.now().isoformat()
            
            # Dev.to provides description. Extract first 150 chars, strip HTML
            description = item.findtext('description') or ''
            clean_summary = re.sub('<[^<]+?>', '', description)[:150] + '...' if description else 'Read the full article for more insights.'
            
            # Attempt to find an image in standard metadata
            image_url = None
            
            articles.append({
                "title": title,
                "summary": clean_summary,
                "url": link,
                "source": source_name,
                "published_at": pub_date,
                "image_url": image_url,
                "technology": "Programming"
            })
            
        return articles
    except Exception as e:
        print(f"Failed to fetch {source_name} feed: {e}")
        return []

@router.get("/", response_model=List[NewsArticle])
async def get_latest_news():
    """
    Fetches tech news from public RSS feeds to provide real-world data without a paid API.
    """
    feeds = [
        {"url": "https://dev.to/feed", "name": "Dev.to"},
        {"url": "https://feeds.feedburner.com/TechCrunch/", "name": "TechCrunch"}
    ]
    
    all_articles = []
    
    # Run synchronous network requests in background threads
    tasks = [
        asyncio.to_thread(fetch_rss_feed, feed["url"], feed["name"])
        for feed in feeds
    ]
    
    results = await asyncio.gather(*tasks)
    
    for feed_result in results:
        all_articles.extend(feed_result)
        
    # Sort by a rough published date heuristics if needed, or stick to mixed list
    # Format according to Pydantic Model
    formatted_articles = []
    for i, a in enumerate(all_articles):
        # Default placeholder image since free RSS often drops images
        img = a.get("image_url") or "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60"
        
        formatted_articles.append(
            NewsArticle(
                id=i+1,
                title=a["title"],
                summary=a["summary"],
                url=a["url"],
                source=a["source"],
                published_at=a["published_at"],
                image_url=img,
                technology=a["technology"]
            )
        )
        
    return formatted_articles
