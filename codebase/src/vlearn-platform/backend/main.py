import os
import re
import json
from datetime import date
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env from parent directory
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(parent_dir, ".env"))

from agent import run_agent

app = FastAPI(title="VLearn Smart Tutor API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local slides
slides_dir = os.path.abspath(os.path.join(parent_dir, "..", "..", "..", "data", "vlearn-pack", "slides"))
if os.path.exists(slides_dir):
    app.mount("/local-slides", StaticFiles(directory=slides_dir), name="local-slides")

# ─── Quota store (in-memory) ────────────────────────────────────────────────
QUOTA_LIMIT = 15
quota_store: Dict[str, Dict[str, Any]] = {}

def get_quota(user_id: str) -> int:
    today = date.today().isoformat()
    entry = quota_store.get(user_id)
    if not entry or entry["date"] != today:
        quota_store[user_id] = {"remaining": QUOTA_LIMIT, "date": today}
        return QUOTA_LIMIT
    return entry["remaining"]

def deduct_quota(user_id: str) -> bool:
    today = date.today().isoformat()
    current = get_quota(user_id)
    if current <= 0:
        return False
    quota_store[user_id] = {"remaining": current - 1, "date": today}
    return True

def refund_quota(user_id: str) -> int:
    today = date.today().isoformat()
    current = get_quota(user_id)
    new_val = min(QUOTA_LIMIT, current + 1)
    quota_store[user_id] = {"remaining": new_val, "date": today}
    return new_val

# ─── Models ────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]] = []
    context: Dict[str, Any] = {}
    userId: str = "anonymous"
    test_me: bool = False

class FeedbackRequest(BaseModel):
    userId: str
    messageIndex: int
    isPositive: bool
    
class EvaluateRequest(BaseModel):
    quizQuestion: str = ""
    quizOptions: List[str] = []
    correctIndex: int = 0
    selectedIndex: int = 0
    citations: Optional[List[Any]] = None
    userId: str = "anonymous"

# ─── API Routes ────────────────────────────────────────────────────────────

@app.get("/api/config")
def get_config():
    return {
        "llmConfigured": bool(os.getenv("LLM_API_KEY")),
        "model": os.getenv("LLM_MODEL")
    }

@app.get("/api/quota")
def get_quota_endpoint(userId: str = "anonymous"):
    return {"remaining": get_quota(userId), "limit": QUOTA_LIMIT}

@app.post("/api/feedback")
def submit_feedback(req: FeedbackRequest):
    # In a real app, save this to a database
    print(f"[FEEDBACK] User {req.userId} rated message {req.messageIndex} as {'Positive' if req.isPositive else 'Negative'}")
    return {"status": "success"}

@app.get("/api/local-slides")
def get_local_slides():
    slides = []
    # Mocking slide loading logic or adapting from JS.
    # The frontend expects this to just list available slides.
    slide_dirs = [
        r"D:\VinUni\LABS\Batch03-K3-AI-Product-Hackathon\data\vlearn-pack\slide",
        r"D:\VinUni\LABS\Batch03-K3-AI-Product-Hackathon\data\vlearn-pack\slides"
    ]
    for d in slide_dirs:
        if os.path.exists(d):
            for filename in os.listdir(d):
                if filename.lower().endswith(".pdf"):
                    slides.append({
                        "name": filename,
                        "pages": "?",
                        "url": f"/local-slides/{filename}" # Assuming served somehow
                    })
    return {"slides": slides}

def extract_json(text: str) -> Optional[Dict]:
    cleaned = re.sub(r'^```json\s*', '', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'^```\s*', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'```\s*$', '', cleaned)
    cleaned = cleaned.strip()
    
    start = cleaned.find('{')
    end = cleaned.rfind('}')
    if start == -1 or end == -1:
        return None
        
    try:
        return json.loads(cleaned[start:end+1])
    except json.JSONDecodeError:
        return None

@app.post("/api/chat")
def chat(req: ChatRequest):
    quota_remaining = get_quota(req.userId)
    if quota_remaining <= 0:
        return {
            "mode": "quota_exceeded",
            "intent": "out_of_scope",
            "message": "⏰ Bạn đã dùng hết 15 lượt hỏi hôm nay. Quota sẽ reset lúc 00:00. Trả lời đúng câu hỏi kiểm tra để nhận lại lượt!",
            "quiz": None,
            "quota": {"remaining": 0, "limit": QUOTA_LIMIT}
        }
        
    deduct_quota(req.userId)
    
    # Process user question
    last_user_msg = next((m for m in reversed(req.messages) if m.get("role") == "user"), None)
    question = last_user_msg.get("content", "") if last_user_msg else ""
    
    # Inject context into question for Agent
    context_str = "\n".join([
        "=== NGỮ CẢNH HỌC TẬP ===",
        f"Khóa học: {req.context.get('courseTitle', 'AI thực chiến K3')}",
        f"Bài học: {req.context.get('lessonTitle', 'chưa rõ')}",
        f"Slide đang mở: {req.context.get('slideName', 'chưa rõ')} · Trang {req.context.get('page', 1)}",
        f"Đoạn học viên bôi đen: '{req.context.get('selection', '')}'" if req.context.get('selection') else "",
        f"Lượt hỏi còn lại: {get_quota(req.userId)}/15",
        "=== CÂU HỎI CỦA HỌC VIÊN ===",
        question
    ])
    
    try:
        # Run agent
        raw_response = run_agent(context_str, req.messages[:-1], test_me=req.test_me)
        
        parsed = extract_json(raw_response)
        
        if parsed:
            intent = parsed.get("intent", "explain")
            answer = parsed.get("answer", "")
            citations = parsed.get("citations", [])
            quiz = parsed.get("quiz", None)
            quizzes = parsed.get("quizzes", None)
            
            message = answer
            if intent == "out_of_scope":
                message = answer or "Câu hỏi này nằm ngoài phạm vi học thuật. Hãy hỏi TA hoặc giảng viên."
            elif intent == "no_evidence":
                message = answer or "Tôi không tìm thấy thông tin này trong tài liệu buổi học."
                
            if citations:
                citation_text = " · ".join([f"[{c.get('session', 'N/A')} · {c.get('section', 'N/A')}] \"{c.get('quote', '...')}\"" for c in citations])
                message += f"\n\n📚 **Nguồn:** {citation_text}"
                
            # Formatting the `quiz` correctly if the frontend expects it
            if quiz:
                quiz = {
                    "question": quiz.get("question", ""),
                    "options": quiz.get("options", []),
                    "correctIndex": quiz.get("correct_index", 0),
                    "explanation": quiz.get("explanation", "")
                }
            
            if quizzes:
                quizzes = [
                    {
                        "question": q.get("question", ""),
                        "options": q.get("options", []),
                        "correctIndex": q.get("correct_index", 0),
                        "explanation": q.get("explanation", "")
                    } for q in quizzes
                ]
            
            return {
                "mode": "llm",
                "intent": intent,
                "message": message,
                "citations": citations,
                "quiz": quiz,
                "quizzes": quizzes,
                "quota": {"remaining": get_quota(req.userId), "limit": QUOTA_LIMIT}
            }
        else:
            return {
                "mode": "llm_raw",
                "intent": "explain",
                "message": raw_response,
                "quiz": None,
                "quota": {"remaining": get_quota(req.userId), "limit": QUOTA_LIMIT}
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        refund_quota(req.userId)
        return {
            "error": f"Lỗi khi gọi AgentRAG: {str(e)}",
            "details": str(e),
            "quota": {"remaining": get_quota(req.userId), "limit": QUOTA_LIMIT}
        }

@app.post("/api/evaluate")
def evaluate(req: EvaluateRequest):
    is_correct = req.selectedIndex == req.correctIndex
    result = "correct" if is_correct else "incorrect"
    
    new_quota = get_quota(req.userId)
    if is_correct:
        new_quota = refund_quota(req.userId)
        
    explanation = "✅ Chính xác! Câu trả lời của bạn đúng với nội dung bài giảng." if is_correct else f"❌ Chưa chính xác. Đáp án đúng là {chr(65 + req.correctIndex)}."
    
    return {
        "result": result,
        "explanation": explanation,
        "transcriptReference": "",
        "quotaAction": "refund" if is_correct else "none",
        "quota": {"remaining": new_quota, "limit": QUOTA_LIMIT}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
