"""
Custom exceptions for the Mindporium application.
Provides specific error types for better error handling and debugging.
"""
from typing import Any, Optional


class MindporiumException(Exception):
    """Base exception for all Mindporium errors."""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Any] = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class AuthenticationError(MindporiumException):
    """Raised when authentication fails."""
    def __init__(self, message: str = "Authentication failed", details: Optional[Any] = None):
        super().__init__(message, status_code=401, details=details)


class AuthorizationError(MindporiumException):
    """Raised when user doesn't have permission."""
    def __init__(self, message: str = "Not authorized to perform this action", details: Optional[Any] = None):
        super().__init__(message, status_code=403, details=details)


class ResourceNotFoundError(MindporiumException):
    """Raised when a requested resource is not found."""
    def __init__(self, resource: str, resource_id: Any = None):
        message = f"{resource} not found"
        if resource_id:
            message += f" (ID: {resource_id})"
        super().__init__(message, status_code=404, details={"resource": resource, "id": resource_id})


class ValidationError(MindporiumException):
    """Raised when data validation fails."""
    def __init__(self, message: str, field: Optional[str] = None, details: Optional[Any] = None):
        super().__init__(message, status_code=422, details=details or {"field": field})


class DuplicateResourceError(MindporiumException):
    """Raised when trying to create a duplicate resource."""
    def __init__(self, resource: str, field: str, value: Any):
        message = f"{resource} with {field}='{value}' already exists"
        super().__init__(message, status_code=409, details={"resource": resource, "field": field, "value": value})


class BusinessLogicError(MindporiumException):
    """Raised when business logic validation fails."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message, status_code=400, details=details)


class ExternalServiceError(MindporiumException):
    """Raised when external service (email, AI, etc.) fails."""
    def __init__(self, service: str, message: str, details: Optional[Any] = None):
        super().__init__(
            f"{service} service error: {message}", 
            status_code=503, 
            details={"service": service, **({} if details is None else details)}
        )


class RateLimitExceededError(MindporiumException):
    """Raised when rate limit is exceeded."""
    def __init__(self, message: str = "Rate limit exceeded. Please try again later."):
        super().__init__(message, status_code=429)


class DatabaseError(MindporiumException):
    """Raised when database operation fails."""
    def __init__(self, message: str = "Database operation failed", details: Optional[Any] = None):
        super().__init__(message, status_code=500, details=details)
