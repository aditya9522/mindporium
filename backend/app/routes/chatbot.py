from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.chatbot import ChatSession, ChatMessage
from app.models.user import User
from app.schemas.chatbot import ChatSessionResponse, ChatMessageCreate, ChatMessageResponse, StudyCompanionRequest
from app.services.llm_service import llm_service
from app.utils.utils import extract_json_array

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


@router.post("/study-companion", response_model=dict)
async def study_companion(
    payload: StudyCompanionRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Generate study guide notes, flashcards, or chat with a tutor inside a course player.
    """
    if payload.action == "notes":
        prompt = f"""
        You are an expert educator. Generate detailed, structured study notes and 3 key takeaways for the lesson '{payload.lesson_title}' in the course '{payload.course_title}'.
        Lesson Description:
        {payload.lesson_description}

        Return the study guide formatted beautifully in clean, professional Markdown. Focus on summarizing core concepts, providing bullet points for readability, and ending with a dedicated 'Key Takeaways' section.
        Do not include any introductory remarks or explanations outside of the study guide.
        """.strip()
        response_text = await llm_service.generate_response(prompt)
        return {"notes": response_text}
        
    elif payload.action == "flashcards":
        prompt = f"""
        You are an academic test maker. Generate exactly 5 interactive study flashcards (Q&A) to help students recall key concepts from the lesson '{payload.lesson_title}' in the course '{payload.course_title}'.
        Lesson Description:
        {payload.lesson_description}

        Return a valid JSON array of objects. Do not return markdown, do not write code fences, just return raw JSON using the exact schema:
        [
        {{"question": "What is ...?", "answer": "..."}}
        ]
        """.strip()
        response_text = await llm_service.generate_response(prompt)
        flashcards = extract_json_array(response_text)
        return {"flashcards": flashcards}
        
    elif payload.action == "chat":
        if not payload.user_query:
            raise HTTPException(status_code=400, detail="user_query is required for action 'chat'")
            
        system_instruction = f"""
        You are an expert AI Study Tutor. You are helping a student learn and understand the lesson '{payload.lesson_title}' of the course '{payload.course_title}'.
        Lesson Description:
        {payload.lesson_description}

        Answer the student's question concisely, clearly, and in a helpful educational manner, keeping the context of this lesson in mind.
        """.strip()

        llm_history = []
        if payload.history:
            for item in payload.history:
                role = "user" if item.get("sender") == "user" else "model"
                content = item.get("content") or ""
                llm_history.append({"role": role, "parts": [content]})
        
        full_prompt = f"{system_instruction}\n\nStudent's question: {payload.user_query}"
        response_text = await llm_service.generate_response(full_prompt, history=llm_history)
        return {"response": response_text}
        
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
