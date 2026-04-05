"""
ACIAS — Chatbot API Routes
"""
from fastapi import APIRouter
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.chatbot_service import process_chat

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    result = process_chat(body.message, body.history or [])
    return ChatResponse(**result)


@router.get("/suggestions")
async def get_suggestions():
    return {
        "suggestions": [
            "Which customers are at critical churn risk?",
            "Show me today's KPI summary",
            "What's our current NRR?",
            "Which segment has the highest MRR at risk?",
            "How is the churn model performing?",
            "Show me the Expansion Ready segment",
            "What actions are pending for CSM?",
            "What's the average CLV for Champion Users?",
        ]
    }
