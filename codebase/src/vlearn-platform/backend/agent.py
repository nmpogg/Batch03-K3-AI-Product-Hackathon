import os
import json
from typing import List, Dict, Any, Optional
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor, tool
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain_core.pydantic_v1 import BaseModel, Field

VECTOR_DB_DIR = r"D:\VinUni\LABS\Batch03-K3-AI-Product-Hackathon\codebase\src\vlearn-platform\backend\vector_store"
SYSTEM_PROMPT_PATH = r"D:\VinUni\LABS\Batch03-K3-AI-Product-Hackathon\codebase\src\vlearn-platform\backend\system_prompt.md"

# Load System Prompt
with open(SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as f:
    system_prompt_content = f.read()

# Load Vector DB
print("Loading Vector DB...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
if os.path.exists(os.path.join(VECTOR_DB_DIR, "index.faiss")):
    vectorstore = FAISS.load_local(VECTOR_DB_DIR, embeddings, allow_dangerous_deserialization=True)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    print("Vector DB loaded.")
else:
    print(f"WARNING: Vector DB not found at {VECTOR_DB_DIR}. Retriever will return empty.")
    from langchain.schema import Document
    vectorstore = FAISS.from_documents([Document(page_content="Không có dữ liệu.", metadata={"source": "none", "header": "none"})], embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 1})

@tool
def search_documents(query: str) -> str:
    """
    Tìm kiếm thông tin trong bài giảng.
    Luôn sử dụng công cụ này để lấy thông tin (context) trước khi trả lời câu hỏi.
    Kết quả trả về bao gồm nội dung đoạn trích và metadata (tên file, tiêu đề) để làm trích dẫn (citation).
    """
    docs = retriever.invoke(query)
    if not docs:
        return "Không tìm thấy thông tin nào liên quan."
    
    result = []
    for i, doc in enumerate(docs):
        source = doc.metadata.get("source", "Không rõ nguồn")
        header = doc.metadata.get("header", "Không rõ section")
        result.append(f"--- Kết quả {i+1} ---\nNguồn: {source}\nPhần: {header}\nNội dung:\n{doc.page_content}\n")
    return "\n".join(result)

class Citation(BaseModel):
    session: str = Field(description="Ví dụ: Day 1")
    section: str = Field(description="Ví dụ: §2")
    quote: str = Field(description="Đoạn trích nguyên văn")

class Quiz(BaseModel):
    question: str = Field(description="Câu hỏi trắc nghiệm")
    options: List[str] = Field(description="Đúng 4 lựa chọn (A, B, C, D)")
    correct_index: int = Field(description="Vị trí đáp án đúng (0-3)")
    explanation: str = Field(description="Giải thích")

class SubmitResponseInput(BaseModel):
    intent: str = Field(description="explain | clarify | out_of_scope | no_evidence | evaluate")
    answer: str = Field(description="Chỉ chứa phần giải thích. TUYỆT ĐỐI KHÔNG chứa nội dung câu hỏi trắc nghiệm.")
    citations: Optional[List[Citation]] = Field(default_factory=list)
    quiz: Optional[Quiz] = Field(None, description="JSON object chứa câu hỏi trắc nghiệm ứng dụng. BẮT BUỘC PHẢI CÓ khi intent='explain'.")
    quizzes: Optional[List[Quiz]] = Field(None, description="Không sử dụng (đã tắt).")

@tool("submit_response", args_schema=SubmitResponseInput)
def submit_response(intent: str, answer: str, citations: Optional[List[Citation]] = None, quiz: Optional[Quiz] = None, quizzes: Optional[List[Quiz]] = None) -> str:
    """
    Sử dụng công cụ này để đưa ra câu trả lời cuối cùng cho người dùng. 
    Bắt buộc phải gọi công cụ này để kết thúc việc suy nghĩ và đưa ra kết quả.
    """
    citations_dict = [c.dict() for c in citations] if citations else []
    quiz_dict = quiz.dict() if quiz else None
    quizzes_dict = [q.dict() for q in quizzes] if quizzes else None
    
    return json.dumps({
        "intent": intent,
        "answer": answer,
        "citations": citations_dict,
        "quiz": quiz_dict,
        "quizzes": quizzes_dict
    }, ensure_ascii=False)

def build_agent_executor():
    api_key = os.getenv("LLM_API_KEY", "dummy_key")
    base_url = os.getenv("LLM_API_BASE_URL", "https://openrouter.ai/api/v1")
    model_name = os.getenv("LLM_MODEL", "inclusionai/ling-3.0-flash:free")
    
    llm = ChatOpenAI(
        model=model_name,
        api_key=api_key,
        base_url=base_url,
        temperature=0.1
    )
    
    tools = [search_documents, submit_response]
    
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=system_prompt_content),
        ("placeholder", "{chat_history}"),
        ("user", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, return_intermediate_steps=True)
    return agent_executor

agent_executor = build_agent_executor()

def run_agent(question: str, chat_history: List[Dict[str, str]] = None, test_me: bool = False) -> str:
    history = []
    if chat_history:
        from langchain_core.messages import HumanMessage, AIMessage
        for msg in chat_history:
            if msg.get("role") == "user":
                history.append(HumanMessage(content=msg.get("content", "")))
            elif msg.get("role") == "assistant":
                history.append(AIMessage(content=msg.get("content", "")))
                
    if test_me:
        question = "Người dùng yêu cầu kiểm tra kiến thức. Hãy viết một câu dẫn ngắn (hoặc tổng hợp ý chính) vào trường `answer`. BẮT BUỘC KHÔNG VIẾT NỘI DUNG CÂU HỎI TRẮC NGHIỆM VÀO TRƯỜNG `answer` (vì UI đã tự động vẽ câu hỏi). Sinh ra 3 câu hỏi trắc nghiệm và CHỈ truyền chúng vào trường `quizzes` của tool `submit_response`."
    else:
        strict_reminder = "\n\n(LƯU Ý TỪ HỆ THỐNG: TUYỆT ĐỐI KHÔNG VIẾT DỮ LIỆU JSON HAY TEXT CỦA CÂU HỎI TRẮC NGHIỆM VÀO TRƯỜNG `answer`! Câu hỏi trắc nghiệm phải được truyền qua tham số `quiz` của tool.)"
        question = question + strict_reminder
                
    response = agent_executor.invoke({
        "input": question,
        "chat_history": history
    })
    
    # Tìm kết quả từ submit_response trong intermediate_steps
    for action, observation in response.get("intermediate_steps", []):
        if action.tool == "submit_response":
            return observation
            
    # Nếu agent không gọi submit_response, trả về chuỗi JSON rỗng để frontend không bị lỗi hoàn toàn
    return json.dumps({"intent": "explain", "answer": response["output"]}, ensure_ascii=False)
