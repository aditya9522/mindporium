"""
Validation utilities for common data validation tasks.
"""
from typing import Optional, List
import re
from datetime import datetime

from app.core.exceptions import ValidationError


class Validator:
    """Common validation methods."""
    
    @staticmethod
    def validate_email(email: str, field_name: str = "email") -> str:
        """Validate email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValidationError(f"Invalid email format", field=field_name)
        return email.lower()
    
    @staticmethod
    def validate_password(password: str, min_length: int = 8) -> str:
        """
        Validate password strength.
        Requirements: min length, at least one uppercase, one lowercase, one digit
        """
        if len(password) < min_length:
            raise ValidationError(
                f"Password must be at least {min_length} characters long",
                field="password"
            )
        
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                "Password must contain at least one uppercase letter",
                field="password"
            )
        
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                "Password must contain at least one lowercase letter",
                field="password"
            )
        
        if not re.search(r'\d', password):
            raise ValidationError(
                "Password must contain at least one digit",
                field="password"
            )
        
        return password
    
    @staticmethod
    def validate_phone(phone: str, field_name: str = "phone_number") -> str:
        """Validate phone number format."""
        # Remove common separators
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        
        # Check if it's all digits and reasonable length
        if not cleaned.isdigit() or len(cleaned) < 10 or len(cleaned) > 15:
            raise ValidationError(
                "Invalid phone number format",
                field=field_name
            )
        
        return phone
    
    @staticmethod
    def validate_url(url: str, field_name: str = "url") -> str:
        """Validate URL format."""
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, url, re.IGNORECASE):
            raise ValidationError(
                "Invalid URL format",
                field=field_name
            )
        return url
    
    @staticmethod
    def validate_date_range(
        start_date: datetime,
        end_date: datetime,
        field_name: str = "date_range"
    ) -> tuple[datetime, datetime]:
        """Validate that end_date is after start_date."""
        if end_date <= start_date:
            raise ValidationError(
                "End date must be after start date",
                field=field_name
            )
        return start_date, end_date
    
    @staticmethod
    def validate_positive_number(
        value: float,
        field_name: str = "value",
        allow_zero: bool = False
    ) -> float:
        """Validate that number is positive."""
        if allow_zero:
            if value < 0:
                raise ValidationError(
                    f"{field_name} must be non-negative",
                    field=field_name
                )
        else:
            if value <= 0:
                raise ValidationError(
                    f"{field_name} must be positive",
                    field=field_name
                )
        return value
    
    @staticmethod
    def validate_range(
        value: float,
        min_val: float,
        max_val: float,
        field_name: str = "value"
    ) -> float:
        """Validate that value is within range."""
        if value < min_val or value > max_val:
            raise ValidationError(
                f"{field_name} must be between {min_val} and {max_val}",
                field=field_name
            )
        return value
    
    @staticmethod
    def validate_string_length(
        text: str,
        min_length: Optional[int] = None,
        max_length: Optional[int] = None,
        field_name: str = "text"
    ) -> str:
        """Validate string length."""
        if min_length and len(text) < min_length:
            raise ValidationError(
                f"{field_name} must be at least {min_length} characters",
                field=field_name
            )
        
        if max_length and len(text) > max_length:
            raise ValidationError(
                f"{field_name} must not exceed {max_length} characters",
                field=field_name
            )
        
        return text
    
    @staticmethod
    def validate_choice(
        value: str,
        choices: List[str],
        field_name: str = "value"
    ) -> str:
        """Validate that value is in allowed choices."""
        if value not in choices:
            raise ValidationError(
                f"{field_name} must be one of: {', '.join(choices)}",
                field=field_name,
                details={"allowed_values": choices}
            )
        return value
    
    @staticmethod
    def validate_file_size(
        file_size: int,
        max_size_mb: int = 25,
        field_name: str = "file"
    ) -> int:
        """Validate file size."""
        max_size_bytes = max_size_mb * 1024 * 1024
        if file_size > max_size_bytes:
            raise ValidationError(
                f"File size must not exceed {max_size_mb}MB",
                field=field_name
            )
        return file_size
    
    @staticmethod
    def validate_file_extension(
        filename: str,
        allowed_extensions: List[str],
        field_name: str = "file"
    ) -> str:
        """Validate file extension."""
        extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        
        if extension not in allowed_extensions:
            raise ValidationError(
                f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}",
                field=field_name,
                details={"allowed_extensions": allowed_extensions}
            )
        
        return filename
