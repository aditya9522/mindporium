from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Community(TimestampMixin, Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, autoincrement=True)

    name = Column(String(255), nullable=False, index=True)
    description = Column(String(2000), nullable=True)
    icon = Column(String(1024), nullable=True)
    banner = Column(String(1024), nullable=True)

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    is_private = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    member_count = Column(Integer, nullable=False, default=0)
    post_count = Column(Integer, nullable=False, default=0)

    created_by_user = relationship("User", back_populates="created_communities")
    posts = relationship("CommunityPost", back_populates="community", cascade="all, delete-orphan")
    subscriptions = relationship("CommunitySubscription", back_populates="community", cascade="all, delete-orphan")
    bans = relationship("CommunityBan", back_populates="community", cascade="all, delete-orphan")


class CommunityPost(TimestampMixin, Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)

    community_id = Column(Integer, ForeignKey("communities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)

    attachments = Column(String(2048), nullable=True)

    is_pinned = Column(Boolean, nullable=False, default=False)
    is_locked = Column(Boolean, nullable=False, default=False)
    is_deleted = Column(Boolean, nullable=False, default=False)

    view_count = Column(Integer, nullable=False, default=0)
    like_count = Column(Integer, nullable=False, default=0)
    dislike_count = Column(Integer, nullable=False, default=0)
    comment_count = Column(Integer, nullable=False, default=0)

    community = relationship("Community", back_populates="posts")
    user = relationship("User", back_populates="community_posts")
    comments = relationship("CommunityComment", back_populates="post", cascade="all, delete-orphan")
    reactions = relationship("CommunityReaction", back_populates="post", cascade="all, delete-orphan")


class CommunityComment(TimestampMixin, Base):
    __tablename__ = "community_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)

    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    parent_comment_id = Column(Integer, ForeignKey("community_comments.id", ondelete="CASCADE"), nullable=True)

    content = Column(Text, nullable=False)

    is_deleted = Column(Boolean, nullable=False, default=False)
    like_count = Column(Integer, nullable=False, default=0)

    post = relationship("CommunityPost", back_populates="comments")
    user = relationship("User")

    parent_comment = relationship(
        "CommunityComment",
        remote_side="CommunityComment.id",
        cascade="all, delete-orphan",
        single_parent=True,
    )

    replies = relationship(
        "CommunityComment",
        back_populates="parent_comment",
        cascade="all, delete-orphan"
    )


class CommunityReaction(TimestampMixin, Base):
    __tablename__ = "community_reactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reaction_type = Column(String(50), nullable=False)

    post = relationship("CommunityPost", back_populates="reactions")
    user = relationship("User")


class CommunitySubscription(TimestampMixin, Base):
    __tablename__ = "community_subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    community_id = Column(Integer, ForeignKey("communities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_moderator = Column(Boolean, nullable=False, default=False)
    notifications_enabled = Column(Boolean, nullable=False, default=True)

    community = relationship("Community", back_populates="subscriptions")
    user = relationship("User", back_populates="community_subscriptions")


class CommunityBan(TimestampMixin, Base):
    __tablename__ = "community_bans"

    id = Column(Integer, primary_key=True, autoincrement=True)

    community_id = Column(Integer, ForeignKey("communities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    banned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    reason = Column(String(1000), nullable=True)
    is_permanent = Column(Boolean, nullable=False, default=False)
    expires_at = Column(String(100), nullable=True)

    community = relationship("Community", back_populates="bans")
    banned_user = relationship("User", back_populates="community_bans", foreign_keys=[user_id])
    banned_by_user = relationship("User", back_populates="bans_issued", foreign_keys=[banned_by])
