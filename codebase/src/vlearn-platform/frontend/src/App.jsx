import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bot, Send, ChevronLeft, ChevronRight, Moon, UserRound, MousePointer2, Pen, Highlighter, Download, CheckCircle2, XCircle, CircleHelp, ThumbsUp, ThumbsDown, BookOpenCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './index.css';

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const COURSE = {
  id: 'ai-thuc-chien-k3',
  code: 'COMP2010 - Khóa 3 + 4 Phase 1',
  slide: { name: 'd1-slide-hackathon.pdf', pages: 83, url: '/local-slides/d1-slide-hackathon.pdf' }
};

function App() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Xin chào! Mình là VLearn Tutor 🎓\n\nMình có thể giải thích nội dung bài học dựa trên transcript và sinh câu hỏi kiểm tra hiểu bài. Trả lời đúng → hoàn lại 1 lượt hỏi!\n\nNhập câu hỏi bên dưới nhé.'
  }]);
  const [inputValue, setInputValue] = useState('');
  const [quota, setQuota] = useState({ remaining: 15, limit: 15 });
  const [activePage, setActivePage] = useState(1);
  const [numPages, setNumPages] = useState(COURSE.slide.pages);
  const [availableSlides, setAvailableSlides] = useState([COURSE.slide]);
  const [currentSlide, setCurrentSlide] = useState(COURSE.slide);
  const [userId] = useState(() => 'user-' + Math.random().toString(36).slice(2, 10));
  const chatBodyRef = useRef(null);

  // Fetch initial quota and available slides
  useEffect(() => {
    fetch(`/api/quota?userId=${userId}`)
      .then(res => res.json())
      .then(data => setQuota(data))
      .catch(console.error);
      
    fetch('/api/local-slides')
      .then(res => res.json())
      .then(data => {
        if (data.slides && data.slides.length > 0) {
          setAvailableSlides(data.slides);
          // Set to first slide if current isn't in the list
          if (!data.slides.find(s => s.url === currentSlide.url)) {
            setCurrentSlide(data.slides[0]);
            setActivePage(1);
          }
        }
      })
      .catch(console.error);
  }, [userId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (quota.remaining <= 0) {
      alert('⏰ Hết lượt hỏi hôm nay! Trả lời đúng quiz để nhận lại lượt.');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: inputValue.trim() }];
    setMessages([...newMessages, { role: 'assistant', content: '...', loading: true }]);
    setInputValue('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => !m.loading),
          context: {
            courseTitle: 'AI thực chiến K3',
            lessonTitle: currentSlide.name,
            slideName: currentSlide.name,
            page: activePage
          },
          userId
        })
      });
      const data = await response.json();
      
      setMessages(prev => {
        const filtered = prev.filter(m => !m.loading);
        return [...filtered, {
          role: 'assistant',
          content: data.message || data.error || 'Tutor chưa có phản hồi.',
          quiz: data.quiz ? { ...data.quiz, _citations: data.citations } : null,
          quizzes: data.quizzes ? data.quizzes.map(q => ({ ...q, _citations: data.citations })) : null,
          intent: data.intent,
          feedback: null
        }];
      });
      if (data.quota) setQuota(data.quota);
    } catch (err) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.loading);
        return [...filtered, { role: 'assistant', content: 'Lỗi kết nối server local.' }];
      });
    }
  };

  const handleFeedback = (index, isPositive) => {
    setMessages(prev => {
      const newMsgs = [...prev];
      newMsgs[index].feedback = isPositive ? 'positive' : 'negative';
      return newMsgs;
    });
    
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        messageIndex: index,
        isPositive
      })
    }).catch(console.error);
  };

  const handleQuizAnswer = async (messageIndex, optionIndex, quizIndex = -1) => {
    const msg = messages[messageIndex];
    let activeQuiz = null;
    
    if (quizIndex >= 0 && msg.quizzes) {
      activeQuiz = msg.quizzes[quizIndex];
    } else if (msg.quiz) {
      activeQuiz = msg.quiz;
    }
    
    if (!activeQuiz || activeQuiz.selectedIndex !== undefined) return;

    // Optimistic UI update
    const updatedMessages = [...messages];
    if (quizIndex >= 0) {
      updatedMessages[messageIndex].quizzes[quizIndex].selectedIndex = optionIndex;
    } else {
      updatedMessages[messageIndex].quiz.selectedIndex = optionIndex;
    }
    setMessages(updatedMessages);

    try {
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizQuestion: activeQuiz.question,
          quizOptions: activeQuiz.options,
          correctIndex: activeQuiz.correctIndex,
          selectedIndex: optionIndex,
          citations: activeQuiz._citations || [],
          userId
        })
      });
      const evalPayload = await evalRes.json();
      
      setMessages(prev => {
        const newMsgs = [...prev];
        let targetQuiz = quizIndex >= 0 ? newMsgs[messageIndex].quizzes[quizIndex] : newMsgs[messageIndex].quiz;
        if (evalPayload.explanation) {
          targetQuiz.serverExplanation = evalPayload.explanation;
        }
        return newMsgs;
      });
      
      if (evalPayload.quota) {
        setQuota(evalPayload.quota);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      <header className="topbar">
        <button className="icon-btn"><ChevronLeft size={20}/></button>
        <div className="brand">
          <div style={{color: 'var(--red)'}}>V</div>Learn
        </div>
        <div style={{marginLeft: 20}}>
          <select 
            style={{fontSize: 16, margin: 0, fontWeight: 700, background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', cursor: 'pointer', appearance: 'none'}}
            value={currentSlide.url}
            onChange={(e) => {
              const slide = availableSlides.find(s => s.url === e.target.value);
              if (slide) {
                setCurrentSlide(slide);
                setActivePage(1);
              }
            }}
          >
            {availableSlides.map((s, idx) => (
              <option key={idx} value={s.url} style={{color: '#000'}}>{s.name}</option>
            ))}
          </select>
          <p style={{fontSize: 13, color: 'var(--muted)', margin: 0}}>{COURSE.code}</p>
        </div>
      </header>

      <main className="main-layout">
        <section className="viewer-panel">
          <div className="pdf-container">
            <div className="pdf-header">
              <div style={{display: 'flex', gap: 12}}>
                <button className="pill-btn" style={{background: 'var(--surface-soft)', color: 'var(--text)'}}>Slide Bài Giảng</button>
              </div>
              <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                <span style={{fontSize: 14, fontWeight: 600}}>Trang {activePage} / {numPages || '?'}</span>
                <button className="icon-btn" onClick={() => setActivePage(p => Math.max(1, p - 1))}><ChevronLeft size={16}/></button>
                <button className="icon-btn" onClick={() => setActivePage(p => Math.min(numPages || 1, p + 1))}><ChevronRight size={16}/></button>
              </div>
            </div>
            <div className="pdf-viewer">
              {useMemo(() => (
                <Document
                  file={currentSlide.url}
                  loading={<div className="pdf-loading">Đang tải slide...</div>}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  <Page 
                    pageNumber={activePage} 
                    width={800}
                    renderAnnotationLayer={false}
                  />
                </Document>
              ), [activePage, currentSlide.url])}
            </div>
          </div>
        </section>

        <aside className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-icon"><Bot size={24}/></div>
            <div className="chat-header-info">
              <h2>VLearn Tutor</h2>
              <div className="status-dot">Trợ lý học theo ngữ cảnh</div>
            </div>
          </div>
          
          <div className="chat-quota">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 6}}>
              <span>Lượt hỏi còn lại</span>
              <strong style={{color: 'var(--text)'}}>{quota.remaining} / {quota.limit}</strong>
            </div>
            <div className="quota-bar-bg">
              <div className="quota-bar-fill" style={{width: `${Math.round((quota.remaining / quota.limit) * 100)}%`}}></div>
            </div>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            <div style={{fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 10}}>
              Ngữ cảnh: {currentSlide.name} · trang {activePage}
            </div>
            
            {messages.map((m, i) => {
              const quizzesToRender = m.quizzes || (m.quiz ? [m.quiz] : []);
              return (
                <div key={i} className={`message ${m.role}`}>
                  <div className="markdown-content">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  
                  {quizzesToRender.map((quizObj, qIdx) => (
                    <div key={qIdx} className="quiz-container" style={{marginTop: 10}}>
                      <div className="quiz-label"><CircleHelp size={16}/> Kiểm tra nhanh</div>
                      <div className="quiz-question">{quizObj.question}</div>
                      <div className="quiz-options">
                        {quizObj.options.map((opt, optIdx) => {
                          const hasAnswered = quizObj.selectedIndex !== undefined;
                          const isSelected = quizObj.selectedIndex === optIdx;
                          const isCorrect = quizObj.correctIndex === optIdx;
                          let btnClass = 'quiz-option';
                          if (hasAnswered) {
                            if (isSelected) {
                              btnClass += isCorrect ? ' selected correct' : ' selected incorrect';
                            } else if (isCorrect) {
                              btnClass += ' selected correct';
                            }
                          }
                          
                          return (
                            <button 
                              key={optIdx} 
                              className={btnClass}
                              onClick={() => handleQuizAnswer(i, optIdx, m.quizzes ? qIdx : -1)}
                              disabled={hasAnswered}
                            >
                              <div className="quiz-option-key">{String.fromCharCode(65 + optIdx)}</div>
                              <div style={{flex: 1}}>{opt}</div>
                              {hasAnswered && isCorrect && <CheckCircle2 size={18} color="var(--green)"/>}
                              {hasAnswered && isSelected && !isCorrect && <XCircle size={18} color="var(--red)"/>}
                            </button>
                          );
                        })}
                      </div>
                      {quizObj.selectedIndex !== undefined && (
                        <div className={`quiz-feedback ${quizObj.selectedIndex === quizObj.correctIndex ? 'correct' : 'incorrect'}`}>
                          <strong>{quizObj.selectedIndex === quizObj.correctIndex ? 'Chính xác! ✅ +1 lượt' : 'Chưa chính xác ❌'}</strong>
                          <p style={{marginTop: 6, marginBottom: 0}}>{quizObj.serverExplanation || quizObj.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {m.role === 'assistant' && !m.loading && (
                    <div className="feedback-actions">
                      <button 
                        className={`feedback-btn ${m.feedback === 'positive' ? 'active positive' : ''}`} 
                        onClick={() => handleFeedback(i, true)}
                        title="Hữu ích"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button 
                        className={`feedback-btn ${m.feedback === 'negative' ? 'active negative' : ''}`} 
                        onClick={() => handleFeedback(i, false)}
                        title="Không hữu ích"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="chat-input-container">
            <form className="chat-form" onSubmit={handleSendChat}>
              <input 
                type="text" 
                placeholder="Hỏi đáp về nội dung bài học..." 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              <button 
                type="submit" 
                className="send-btn" 
                disabled={!inputValue.trim() || quota.remaining <= 0}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
