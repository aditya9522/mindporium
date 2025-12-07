import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_sessionmaker
from app.models.user import User
from app.models.course import Course
from app.models.subject import Subject
from app.models.system_setting import SystemSetting
from app.core.security import get_password_hash
from app.models.enums import RoleEnum, LevelEnum, CategoryEnum

async def init_sample_data():
    """Initialize database with sample data."""
    async_session = get_sessionmaker()
    async with async_session() as db:
        print("🚀 Starting database initialization...")
        
        # 1. Create Admin User
        admin = User(
            email="admin@mindporium.ai",
            full_name="Admin User",
            password=get_password_hash("admin123"),
            role=RoleEnum.admin,
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        print("✅ Admin user created")
        
        # 2. Create Sample Instructor
        instructor = User(
            email="instructor@mindporium.ai",
            full_name="John Doe",
            password=get_password_hash("instructor123"),
            role=RoleEnum.instructor,
            is_active=True,
            is_verified=True,
            bio="Experienced software engineer with 10+ years in web development",
            experience="Senior Developer at Tech Corp"  
        )
        db.add(instructor)
        print("✅ Instructor user created")
        
        # 3. Create Sample Student
        student = User(
            email="student@mindporium.ai",
            full_name="Jane Smith",
            password=get_password_hash("student123"),
            role=RoleEnum.student,
            is_active=True,
            is_verified=True
        )
        db.add(student)
        print("✅ Student user created")
        
        await db.commit()
        await db.refresh(instructor)
        
        # 4. Create Sample Course
        course = Course(
            title="Full Stack Web Development",
            description="Learn to build modern web applications from scratch using React, Node.js, and PostgreSQL",
            level=LevelEnum.intermediate,
            category=CategoryEnum.paid,
            price=4999.0,
            duration_weeks=12,
            created_by=instructor.id,
            is_published=True,
            tags=["web development", "react", "nodejs", "postgresql"]
        )
        db.add(course)
        print("✅ Sample course created")
        
        await db.commit()
        await db.refresh(course)
        
        # 5. Create Sample Subjects
        subjects_data = [
            {"title": "Introduction to Web Development", "description": "Learn the basics of HTML, CSS, and JavaScript", "order_index": 0},
            {"title": "React Fundamentals", "description": "Master React components, hooks, and state management", "order_index": 1},
            {"title": "Backend with Node.js", "description": "Build RESTful APIs with Express and Node.js", "order_index": 2},
            {"title": "Database Design", "description": "Learn PostgreSQL and database design principles", "order_index": 3},
        ]
        
        for subject_data in subjects_data:
            subject = Subject(
                **subject_data,
                course_id=course.id
            )
            db.add(subject)
        print("✅ Sample subjects created")
        
        # 6. Create System Settings
        settings_data = [
            {"key": "site_name", "value": "Mindporium", "description": "Platform name", "is_public": True, "group": "general"},
            {"key": "maintenance_mode", "value": False, "description": "Enable maintenance mode", "is_public": True, "group": "general"},
            {"key": "max_upload_size_mb", "value": 25, "description": "Maximum file upload size in MB", "is_public": False, "group": "general"},
            {"key": "enable_registrations", "value": True, "description": "Allow new user registrations", "is_public": True, "group": "general"},
        ]
        
        for setting_data in settings_data:
            setting = SystemSetting(**setting_data)
            db.add(setting)
        print("✅ System settings created")
        
        await db.commit()
        
        print("\n" + "="*50)
        print("✨ Database initialization complete!")
        print("="*50)
        print("\n📧 Login Credentials:")
        print("-" * 50)
        print("Admin:")
        print("  Email: admin@mindporium.ai")
        print("  Password: admin123")
        print("\nInstructor:")
        print("  Email: instructor@mindporium.ai")
        print("  Password: instructor123")
        print("\nStudent:")
        print("  Email: student@mindporium.ai")
        print("  Password: student123")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(init_sample_data())
