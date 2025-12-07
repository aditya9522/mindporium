from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    instructor = "instructor"
    student = "student"


class LevelEnum(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class ClassroomStatusEnum(str, Enum):
    not_started = "not_started"
    live = "live"
    late = "late"
    completed = "completed"
    cancelled = "cancelled"


class MessageTypeEnum(str, Enum):
    normal = "normal"
    question = "question"
    answer = "answer"
    system = "system"


class ReactionTypeEnum(str, Enum):
    like = "like"
    dislike = "dislike"


class CategoryEnum(str, Enum):
    free = "free"
    paid = "paid"


class ClassroomTypeEnum(str, Enum):
    trial = "trial"
    free = "free"
    regular = "regular"
    extra = "extra"


class TestStatusEnum(str, Enum):
    draft = "draft"
    published = "published"
    archived = "archived"



class ResourceTypeEnum(str, Enum):
    pdf = "pdf"
    video = "video"
    ppt = "ppt"
    doc = "doc"
    link = "link"
    image = "image"
    other = "other"


class AttendanceStatusEnum(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"


class ClassroomProviderEnum(str, Enum):
    custom = "custom"
    zoom = "zoom"
    google_meet = "google_meet"
    agora = "agora"

