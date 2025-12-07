from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import re
import hashlib
import secrets
import string


def generate_random_string(length: int = 32) -> str:
    """Generate a random string of specified length."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_meeting_id() -> str:
    """Generate a unique meeting ID for classrooms."""
    return f"MTG-{secrets.token_hex(6).upper()}"


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage."""
    # Remove any path components
    filename = filename.split('/')[-1].split('\\')[-1]
    # Remove special characters
    filename = re.sub(r'[^\w\s.-]', '', filename)
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    return filename


def calculate_percentage(part: float, total: float) -> float:
    """Calculate percentage safely."""
    if total == 0:
        return 0.0
    return round((part / total) * 100, 2)


def format_duration(minutes: int) -> str:
    """Format duration in minutes to human-readable format."""
    if minutes < 60:
        return f"{minutes} min"
    hours = minutes // 60
    mins = minutes % 60
    if mins == 0:
        return f"{hours} hr"
    return f"{hours} hr {mins} min"


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to specified length."""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def generate_slug(text: str) -> str:
    """Generate URL-friendly slug from text."""
    # Convert to lowercase
    slug = text.lower()
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    # Remove special characters
    slug = re.sub(r'[^\w-]', '', slug)
    # Remove multiple hyphens
    slug = re.sub(r'-+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug


def get_file_extension(filename: str) -> str:
    return filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''


def is_valid_file_type(filename: str, allowed_types: List[str]) -> bool:
    extension = get_file_extension(filename)
    return extension in allowed_types


def generate_hash(text: str) -> str:
    """Generate SHA256 hash of text."""
    return hashlib.sha256(text.encode()).hexdigest()


def parse_duration_string(duration_str: str) -> Optional[int]:
    try:
        duration_str = duration_str.lower().strip()
        total_minutes = 0
        
        # Handle "Xh Ym" format
        if 'h' in duration_str and 'm' in duration_str:
            parts = duration_str.split()
            for part in parts:
                if 'h' in part:
                    hours = float(part.replace('h', ''))
                    total_minutes += hours * 60
                elif 'm' in part:
                    minutes = float(part.replace('m', ''))
                    total_minutes += minutes
        # Handle "Xh" format
        elif 'h' in duration_str:
            hours = float(duration_str.replace('h', ''))
            total_minutes = hours * 60
        # Handle "Xm" format
        elif 'm' in duration_str:
            total_minutes = float(duration_str.replace('m', ''))
        else:
            # Assume it's just a number in minutes
            total_minutes = float(duration_str)
        
        return int(total_minutes)
    except:
        return None


def get_date_range(period: str) -> tuple[datetime, datetime]:
    now = datetime.utcnow()
    
    if period == 'today':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif period == 'week':
        start = now - timedelta(days=7)
        end = now
    elif period == 'month':
        start = now - timedelta(days=30)
        end = now
    elif period == 'year':
        start = now - timedelta(days=365)
        end = now
    else:
        start = now - timedelta(days=7)  # Default to week
        end = now
    
    return start, end


def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """Split list into chunks of specified size."""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def merge_dicts(*dicts: Dict) -> Dict:
    """Merge multiple dictionaries."""
    result = {}
    for d in dicts:
        result.update(d)
    return result


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    try:
        return numerator / denominator if denominator != 0 else default
    except:
        return default
