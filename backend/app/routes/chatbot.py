from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.chatbot import ChatSession, ChatMessage
from app.models.user import User
from app.schemas.chatbot import ChatSessionResponse, ChatMessageCreate, ChatMessageResponse
from app.services.llm_service import llm_service

router = APIRouter()


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def read_sessions(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all chat sessions for the current user.
    """
    query = select(ChatSession).where(ChatSession.user_id == current_user.id).order_by(desc(ChatSession.updated_at))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_session(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new chat session.
    """
    session = ChatSession(user_id=current_user.id)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def read_session(
    session_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific chat session with messages.
    """
    query = select(ChatSession).options(selectinload(ChatSession.messages)).where(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    )
    result = await db.execute(query)
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    *,
    db: AsyncSession = Depends(deps.get_db),
    session_id: int,
    message_in: ChatMessageCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Send a message to the AI and get a response.
    """
    # 1. Get Session
    query = select(ChatSession).options(selectinload(ChatSession.messages)).where(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    )
    result = await db.execute(query)
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. Save User Message
    user_msg = ChatMessage(
        session_id=session.id,
        sender="user",
        content=message_in.content
    )
    db.add(user_msg)
    
    # 3. Generate Title if first message
    if len(session.messages) == 0:
        new_title = await llm_service.generate_title(message_in.content)
        session.title = new_title
        db.add(session)

    # 4. Prepare History for LLM
    # Gemini expects history as: [{"role": "user", "parts": ["..."]}, {"role": "model", "parts": ["..."]}]
    history = []
    for msg in session.messages:
        role = "user" if msg.sender == "user" else "model"
        history.append({"role": role, "parts": [msg.content]})
    
    # Add current message to history context if not already saved/refreshed
    history.append({"role": "user", "parts": [message_in.content]})

    # 5. Generate AI Response
    ai_response_text = await llm_service.generate_response(message_in.content, history=history[:-1]) # history excludes current prompt usually in API calls depending on lib, but `start_chat` handles it. 
    # Actually `start_chat(history=...)` takes past history. Then `send_message` takes new prompt.
    # So we pass `history` of PREVIOUS messages.
    
    llm_history = []
    for msg in session.messages:
        role = "user" if msg.sender == "user" else "model"
        llm_history.append({"role": role, "parts": [msg.content]})

    ai_response_text = await llm_service.generate_response(message_in.content, history=llm_history)

    # 6. Save AI Message
    ai_msg = ChatMessage(
        session_id=session.id,
        sender="ai",
        content=ai_response_text
    )
    db.add(ai_msg)
    
    await db.commit()
    await db.refresh(ai_msg)
    
    await db.refresh(ai_msg)
    
    return ai_msg


@router.put("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_session(
    *,
    db: AsyncSession = Depends(deps.get_db),
    session_id: int,
    title: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update chat session title.
    """
    result = await db.execute(select(ChatSession).where(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.title = title
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.delete("/sessions/{session_id}")
async def delete_session(
    *,
    db: AsyncSession = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a chat session.
    """
    result = await db.execute(select(ChatSession).where(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.delete(session)
    await db.commit()
    return {"message": "Session deleted successfully"}
