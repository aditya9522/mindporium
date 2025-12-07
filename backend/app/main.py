import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.db.database import init_db, close_db
from app.core.middleware import LoggingMiddleware, RateLimitMiddleware
from app.core.redis import redis_manager
from app.core.exceptions import MindporiumException
from app.utils.exception_handlers import (
    mindporium_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler
)

app = FastAPI(
    title=settings.APP_NAME,
    description="Mindporium Backend APIs - A comprehensive learning platform",
    version="1.0.0",
)

# Register exception handlers
app.add_exception_handler(MindporiumException, mindporium_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

# Ensure static directory exists
os.makedirs("static", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

from app.routes import (
    auth, users, courses, enrollments, classrooms, community, posts, admin, 
    subjects, announcements, qa, tests, chatbot, resources, submissions, 
    feedback, notifications, dashboard_admin, dashboard_instructor, dashboard_student,
    upload, attendance
)
from app.ws import signaling

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(courses.router, prefix="/courses", tags=["Courses"])
app.include_router(subjects.router, prefix="/subjects", tags=["Subjects"])
app.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
app.include_router(classrooms.router, prefix="/classrooms", tags=["Classrooms"])
app.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
app.include_router(announcements.router, prefix="/announcements", tags=["Announcements"])
app.include_router(qa.router, prefix="/qa", tags=["Q&A"])
app.include_router(tests.router, prefix="/tests", tags=["Tests"])
app.include_router(submissions.router, prefix="/submissions", tags=["Submissions"])
app.include_router(community.router, prefix="/communities", tags=["Communities"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(resources.router, prefix="/resources", tags=["Resources"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])

# Dashboard routes
app.include_router(dashboard_admin.router, prefix="/dashboard/admin", tags=["Dashboard - Admin"])
app.include_router(dashboard_instructor.router, prefix="/dashboard/instructor", tags=["Dashboard - Instructor"])
app.include_router(dashboard_student.router, prefix="/dashboard/student", tags=["Dashboard - Student"])

app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(signaling.router, prefix="/ws", tags=["WebSocket"])


@app.on_event("startup")
async def on_startup():
    await init_db()
    await redis_manager.connect()

@app.on_event("shutdown")
async def on_shutdown():
    await close_db()
    await redis_manager.close()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Mindporium API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected" if redis_manager.redis else "disconnected"
    }
