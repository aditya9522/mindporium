from typing import List, Optional
from pydantic import AnyUrl, Field, field_validator
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    APP_NAME: str = "Mindporium"
    ENVIRONMENT: str = "production"  # development | staging | production
    DEBUG: bool = False

    DATABASE_URL: str

    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30  # seconds

    REDIS_URL: str
    REDIS_MAX_CONNECTIONS: int = 20
    REDIS_DEFAULT_TTL: int = 3600

    TURN_URL: Optional[str] = Field(None, env="TURN_URL")
    TURN_USERNAME: Optional[str] = Field(None, env="TURN_USERNAME")
    TURN_PASSWORD: Optional[str] = Field(None, env="TURN_PASSWORD")

    # AI
    GEMINI_API_KEY: Optional[str] = Field(None, env="GEMINI_API_KEY")

    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day by default
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    UPLOADS_DIR: str = Field(default="uploads")
    MAX_UPLOAD_SIZE_BYTES: int = 25 * 1024 * 1024  # 25MB default

    AUTO_CREATE_DB: bool = False

    WORKER_COUNT: int = 2

    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = Field(587, env="SMTP_PORT")
    SMTP_HOST: Optional[str] = Field(None, env="SMTP_HOST")
    SMTP_USER: Optional[str] = Field(None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(None, env="SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: Optional[str] = Field("info@mindporium.ai", env="EMAILS_FROM_EMAIL")
    EMAILS_FROM_NAME: Optional[str] = Field("Mindporium", env="EMAILS_FROM_NAME")
    
    # OTP Settings
    OTP_EXPIRY_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 5
    
    # Frontend URL for links
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def allowed_origins(self):
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [x.strip() for x in self.ALLOWED_ORIGINS.split(",") if x.strip()]
        return self.ALLOWED_ORIGINS

    @property
    def uploads_path(self) -> Path:
        p = Path(self.UPLOADS_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
