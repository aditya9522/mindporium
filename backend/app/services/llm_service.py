import logging
import google.generativeai as genai
from typing import List, Optional
from app.core.config import settings

logger = logging.getLogger("app.services.llm")

class LLMService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            logger.warning("GEMINI_API_KEY not found. LLM features will be disabled.")
            self.model = None

    async def generate_response(self, prompt: str, history: List[dict] = []) -> str:
        if not self.model:
            return "I'm sorry, my AI brain is currently offline (API Key missing)."

        try:
            chat = self.model.start_chat(history=history)
            response = await chat.send_message_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"LLM Generation Error: {e}")
            return "I'm having trouble thinking right now. Please try again later."

    async def generate_title(self, first_message: str) -> str:
        if not self.model:
            return "New Chat"

        try:
            prompt = f"Generate a short, concise title (max 5 words) for a chat session that starts with this message: '{first_message}'. Do not use quotes."
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Title Generation Error: {e}")
            return "New Chat"

llm_service = LLMService()
