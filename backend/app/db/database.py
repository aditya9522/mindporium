from typing import AsyncGenerator, Optional
import logging

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool
from sqlalchemy import text

from app.core.config import settings
from app.db.base import Base

logger = logging.getLogger("app.db")

_engine: Optional[AsyncEngine] = None
_sessionmaker: Optional[async_sessionmaker[AsyncSession]] = None


def _create_engine() -> AsyncEngine:
    global _engine
    if _engine is not None:
        return _engine

    poolclass = None if settings.ENVIRONMENT == "production" else NullPool

    _engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
        pool_pre_ping=True,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        poolclass=poolclass,
    )

    logger.info("Async SQLAlchemy engine initialized.")
    return _engine


def get_engine() -> AsyncEngine:
    return _create_engine()

def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _sessionmaker
    if _sessionmaker is None:
        _sessionmaker = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
        logger.info("Async sessionmaker created.")
    return _sessionmaker


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async_session_maker = get_sessionmaker()
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db(create_tables: bool = True) -> None:
    engine = get_engine()

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connected successfully.")
    except Exception as e:
        logger.exception("Database connection failed: %s", e)
        raise

    if create_tables:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Tables created from SQLAlchemy models.")

async def close_db() -> None:
    global _engine
    if _engine:
        await _engine.dispose()
        logger.info("Database engine disposed.")
        _engine = None
