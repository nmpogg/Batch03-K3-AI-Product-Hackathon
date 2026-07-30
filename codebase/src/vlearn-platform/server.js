import 'dotenv/config';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 5173);
const localSlideDirs = [
  path.join(__dirname, '..', '..', '..', 'data', 'vlearn-pack', 'slide'),
  path.join(__dirname, '..', '..', '..', 'data', 'vlearn-pack', 'slides')
];

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
localSlideDirs.forEach((dir) => {
  app.use('/local-slides', express.static(dir, { 
    fallthrough: true,
    setHeaders: (res, path) => {
      if (path.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
      }
    }
  }));
});

// ─── Quota store (in-memory, keyed by user id or session) ───────────────────
const quotaStore = new Map(); // key: userId, value: { remaining, date }
const QUOTA_LIMIT = 15;

function getQuota(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const entry = quotaStore.get(userId);
  if (!entry || entry.date !== today) {
    quotaStore.set(userId, { remaining: QUOTA_LIMIT, date: today });
    return QUOTA_LIMIT;
  }
  return entry.remaining;
}

function deductQuota(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const current = getQuota(userId);
  if (current <= 0) return false;
  quotaStore.set(userId, { remaining: current - 1, date: today });
  return true;
}

function refundQuota(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const current = getQuota(userId);
  const newVal = Math.min(QUOTA_LIMIT, current + 1);
  quotaStore.set(userId, { remaining: newVal, date: today });
  return newVal;
}

// ─── Load system prompt from prompt.md ──────────────────────────────────────
let cachedSystemPrompt = null;

async function getSystemPrompt() {
  if (cachedSystemPrompt) return cachedSystemPrompt;
  const promptPath = path.join(__dirname, '..', '..', 'prompt.md');
  try {
    const raw = await fs.readFile(promptPath, 'utf-8');
    // Extract the first code block after "## Prompt 1 — System Prompt (Base)"
    const match = raw.match(/## Prompt 1 — System Prompt \(Base\)\s*```\n([\s\S]*?)```/);
    if (match) {
      cachedSystemPrompt = match[1].trim();
    } else {
      cachedSystemPrompt = raw.slice(0, 3000); // fallback: first 3000 chars
    }
  } catch {
    cachedSystemPrompt = 'Bạn là VLearn Tutor. Trả lời bằng tiếng Việt.';
  }
}

// ─── Mock reply (fallback khi không có API key) ──────────────────────────────
function buildMockReply(context) {
  const lesson = context?.lessonTitle || 'bài học hiện tại';
  const slide = context?.slideName || 'slide đang mở';
  const page = context?.page || 1;

  let learningContent = {
    summary: [
      'Hệ thống hiện đang chạy ở chế độ demo do thiếu API Key.',
      'Tính năng tìm kiếm transcript thực tế tạm thời bị tắt.',
      'Hãy thêm khóa API OpenRouter vào biến môi trường LLM_API_KEY để kích hoạt.'
    ],
    quiz: {
      question: 'AI là viết tắt của từ gì?',
      options: ['Artificial Intelligence', 'Automated Interface', 'Advanced Internet', 'Alien Invasion'],
      correctIndex: 0,
      explanation: 'AI là Artificial Intelligence (Trí tuệ nhân tạo).'
    }
  };

  const lessonKey = lesson.toLowerCase();
  if (lessonKey.includes('demo')) {
    learningContent = {
      summary: [
        'Demo nên tập trung vào một luồng người dùng hoàn chỉnh và giá trị sản phẩm tạo ra.',
        'Cần chuẩn bị dữ liệu mẫu ổn định, trạng thái loading, lỗi và phương án fallback.',
        'Một demo tốt cho thấy cả kết quả lẫn cách đánh giá kết quả đó có đáng tin hay không.'
      ],
      quiz: {
        question: 'Điều gì quan trọng nhất trong một demo sản phẩm AI?',
        options: [
          'Hiển thị càng nhiều tính năng càng tốt',
          'Một luồng chính ổn định thể hiện rõ giá trị',
          'Ẩn toàn bộ giới hạn của hệ thống',
          'Chỉ trình bày kiến trúc kỹ thuật'
        ],
        correctIndex: 1,
        explanation:
          'Một luồng chính ổn định giúp người xem hiểu vấn đề, cách sản phẩm giải quyết và giá trị nhận được mà không bị phân tán.'
      }
    };
  }

  return {
    message: [`Tóm tắt ${slide} · trang ${page}`, ...learningContent.summary.map((item) => `• ${item}`)].join('\n\n'),
    quiz: learningContent.quiz
  };
}

// ─── Parse LLM JSON output ───────────────────────────────────────────────────
function parseLLMOutput(rawText, fallback) {
  // Try to extract JSON from markdown code block or raw
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();

  // Find first { ... } block
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

// ─── Local RAG Logic ──────────────────────────────────────────────────────────
let cachedTranscriptChunks = null;

async function loadAndChunkTranscript() {
  if (cachedTranscriptChunks) return cachedTranscriptChunks;
  const transcriptPath = path.join(__dirname, '..', '..', '..', 'data', 'vlearn-pack', 'transcript', 'transcript-04-clean.md');
  try {
    const raw = await fs.readFile(transcriptPath, 'utf-8');
    // Băm nhỏ văn bản theo các đoạn văn (cách nhau bởi 2 dấu xuống dòng)
    const chunks = raw.split('\n\n').map(c => c.trim()).filter(c => c.length > 50);
    cachedTranscriptChunks = chunks;
    return chunks;
  } catch (error) {
    console.error("Error loading transcript:", error);
    return [];
  }
}

function searchRelevantChunks(question, chunks, topK = 3) {
  // Lấy danh sách các từ có độ dài > 2 (loại bỏ từ nối ngắn)
  const keywords = question.toLowerCase().match(/[\p{L}\d]{3,}/gu) || [];
  if (keywords.length === 0) return [];
  
  // Tính điểm mỗi chunk dựa trên số lần xuất hiện của các keywords
  const scoredChunks = chunks.map(chunk => {
    const chunkLower = chunk.toLowerCase();
    let score = 0;
    keywords.forEach(kw => {
      // Đếm số lần xuất hiện của từ khóa trong chunk
      const count = (chunkLower.match(new RegExp(kw, 'g')) || []).length;
      score += count;
    });
    return { chunk, score };
  });

  // Lọc bỏ những chunk không có điểm nào, sắp xếp giảm dần và lấy top K
  return scoredChunks
    .filter(sc => sc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(sc => sc.chunk);
}

// ─── Build user turn message ─────────────────────────────────────────────────
async function buildUserTurn(messages, context, quotaRemaining) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const question = lastUser?.content || '';

  // Local RAG (Bắt buộc dùng RAG cho mọi câu hỏi)
  const chunks = await loadAndChunkTranscript();
  const topChunks = searchRelevantChunks(question, chunks, 3);
  let ragContext = '';
  
  if (topChunks.length > 0) {
    ragContext = [
      '=== TRÍCH ĐOẠN TRANSCRIPT BẮT BUỘC ===',
      'Dưới đây là nội dung trích xuất từ transcript buổi học. BẠN PHẢI DÙNG THÔNG TIN NÀY ĐỂ TRẢ LỜI CÂU HỎI.',
      'NẾU THÔNG TIN ĐỂ TRẢ LỜI CÂU HỎI KHÔNG CÓ TRONG CÁC TRÍCH ĐOẠN NÀY, BẠN PHẢI TRẢ LỜI: "Tôi không tìm thấy thông tin này trong bài giảng" (đặt intent là no_evidence). Tuyệt đối không tự bịa thêm kiến thức bên ngoài.',
      ...topChunks.map(c => `[Trích đoạn]: ${c}`),
      ''
    ].join('\n');
  } else {
    ragContext = [
      '=== TRÍCH ĐOẠN TRANSCRIPT BẮT BUỘC ===',
      'Không tìm thấy đoạn transcript nào khớp với câu hỏi.',
      'BẠN PHẢI TRẢ LỜI: "Tôi không tìm thấy thông tin này trong bài giảng" (đặt intent là no_evidence). Tuyệt đối không tự bịa thêm kiến thức bên ngoài.',
      ''
    ].join('\n');
  }

  const parts = [
    '=== NGỮ CẢNH HỌC TẬP ===',
    `Khóa học: ${context.courseTitle || 'AI thực chiến K3'}`,
    `Bài học: ${context.lessonTitle || 'chưa rõ'}`,
    `Slide đang mở: ${context.slideName || 'chưa rõ'} · Trang ${context.page || 1}`,
    context.selection ? `Đoạn học viên bôi đen: "${context.selection}"` : null,
    `Lượt hỏi còn lại: ${quotaRemaining}/15`,
    '',
    ragContext,
    '=== YÊU CẦU BẮT BUỘC ===',
    'Sau khi giải thích, bạn LUÔN LUÔN phải sinh ra một câu hỏi trắc nghiệm (quiz) để kiểm tra lại kiến thức vừa giải thích ở trường "quiz" trong chuỗi JSON.',
    'Câu hỏi trắc nghiệm phải bám sát vào những gì có trong phần Transcript bên trên.',
    '',
    '=== CÂU HỎI CỦA HỌC VIÊN ===',
    question,
    '',
    '---',
    'Hãy xác định intent và trả về JSON theo schema đã định trong system prompt.'
  ];

  return parts.filter(Boolean).join('\n');
}

// ─── API Routes ──────────────────────────────────────────────────────────────
app.get('/api/config', (_req, res) => {
  res.json({
    llmConfigured: Boolean(process.env.LLM_API_KEY),
    model: process.env.LLM_MODEL || null
  });
});

app.get('/api/quota', (req, res) => {
  const userId = req.query.userId || 'anonymous';
  res.json({ remaining: getQuota(userId), limit: QUOTA_LIMIT });
});

app.get('/api/local-slides', async (_req, res) => {
  const slides = [];

  for (const dir of localSlideDirs) {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        if (file.isFile() && file.name.toLowerCase().endsWith('.pdf')) {
          slides.push({
            name: file.name,
            pages: '?',
            url: `/local-slides/${encodeURIComponent(file.name)}`
          });
        }
      }
    } catch {
      // Optional local slide folders may not exist in every repo checkout.
    }
  }

  res.json({ slides });
});

app.post('/api/chat', async (req, res) => {
  const { messages = [], context = {}, userId = 'anonymous' } = req.body || {};

  // ── Quota check ──────────────────────────────────────────────────────────
  const quotaRemaining = getQuota(userId);
  if (quotaRemaining <= 0) {
    return res.json({
      mode: 'quota_exceeded',
      intent: 'out_of_scope',
      message: '⏰ Bạn đã dùng hết 15 lượt hỏi hôm nay. Quota sẽ reset lúc 00:00. Trả lời đúng câu hỏi kiểm tra để nhận lại lượt!',
      quiz: null,
      quota: { remaining: 0, limit: QUOTA_LIMIT }
    });
  }

  // ── Mock mode (no API key) ────────────────────────────────────────────────
  if (!process.env.LLM_API_KEY) {
    deductQuota(userId);
    const fallback = buildMockReply(context);
    return res.json({
      mode: 'mock',
      intent: 'explain',
      message: fallback.message,
      quiz: fallback.quiz,
      quota: { remaining: getQuota(userId), limit: QUOTA_LIMIT }
    });
  }

  // ── Deduct quota before LLM call ─────────────────────────────────────────
  deductQuota(userId);

  const baseUrl = (process.env.LLM_API_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
  const chatPath = process.env.LLM_CHAT_PATH || '/chat/completions';
  const model = process.env.LLM_MODEL || 'inclusionai/ling-3.0-flash:free';
  const temperature = Number(process.env.LLM_TEMPERATURE || 0.1);

  // ── Build User Turn directly (No Agent Router) ──────────────────────────
  const systemPrompt = await getSystemPrompt();
  const userTurn = await buildUserTurn(messages, context, getQuota(userId));

  // Build upstream message array (keep history but replace last user msg with enriched version)
  const historyMessages = messages
    .slice(-10)
    .map(({ role, content }) => ({ role, content }));

  // Replace or append the enriched user turn
  if (historyMessages.length > 0 && historyMessages[historyMessages.length - 1].role === 'user') {
    historyMessages[historyMessages.length - 1].content = userTurn;
  } else {
    historyMessages.push({ role: 'user', content: userTurn });
  }

  const upstreamMessages = [
    { role: 'system', content: systemPrompt },
    ...historyMessages
  ];

  // ── LLM call via OpenRouter ───────────────────────────────────────────────
  let apiTraceEntry = null;
  try {
    const requestBody = {
      model,
      temperature,
      messages: upstreamMessages
    };

    // Log API call (without key)
    apiTraceEntry = {
      timestamp: new Date().toISOString(),
      model,
      input_tokens_approx: JSON.stringify(upstreamMessages).length / 4,
      context_slide: context.slideName,
      context_page: context.page,
      user_question: messages.slice(-1)[0]?.content?.slice(0, 100)
    };

    const upstream = await fetch(`${baseUrl}${chatPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `http://localhost:${port}`,
        'X-Title': 'VLearn Smart Tutor'
      },
      body: JSON.stringify(requestBody)
    });

    const payload = await upstream.json();

    if (!upstream.ok) {
      // Refund quota on API error
      refundQuota(userId);
      return res.status(upstream.status).json({
        error: payload?.error?.message || 'LLM request failed',
        details: payload,
        quota: { remaining: getQuota(userId), limit: QUOTA_LIMIT }
      });
    }

    const rawContent = payload?.choices?.[0]?.message?.content || '';

    // ── Parse JSON output ─────────────────────────────────────────────────
    const parsed = parseLLMOutput(rawContent);

    if (parsed) {
      // Map parsed JSON → frontend schema
      const intent = parsed.intent || 'explain';
      const answer = parsed.answer || parsed.message || '';
      const citations = Array.isArray(parsed.citations) ? parsed.citations : [];
      const quiz = parsed.quiz
        ? {
            question: parsed.quiz.question,
            options: parsed.quiz.options,
            correctIndex: parsed.quiz.correct_index ?? 0,
            explanation: parsed.quiz.explanation || ''
          }
        : null;
      const clarificationQuestion = parsed.clarification_question || null;

      // Build human-readable message
      let message = '';
      if (intent === 'clarify' && clarificationQuestion) {
        message = `❓ ${clarificationQuestion}`;
      } else if (intent === 'out_of_scope') {
        message = answer || 'Câu hỏi này nằm ngoài phạm vi học thuật. Hãy hỏi TA hoặc giảng viên.';
      } else if (intent === 'no_evidence') {
        message = answer || 'Tôi không tìm thấy thông tin này trong tài liệu buổi học.';
      } else {
        message = answer;
        if (citations.length > 0) {
          message += '\n\n📚 **Nguồn:** ' + citations.map((c) => `[${c.session} · ${c.section}] "${c.quote}"`).join(' · ');
        }
      }

      // Log trace
      console.log('[API TRACE]', JSON.stringify({
        ...apiTraceEntry,
        intent,
        has_quiz: Boolean(quiz),
        has_citations: citations.length > 0,
        output_chars: message.length
      }));

      return res.json({
        mode: 'llm',
        intent,
        message: message || rawContent,
        citations,
        quiz,
        quota: { remaining: getQuota(userId), limit: QUOTA_LIMIT }
      });
    }

    // Fallback: return raw text if JSON parse failed
    console.warn('[server] LLM returned non-JSON, falling back to raw text');
    return res.json({
      mode: 'llm_raw',
      intent: 'explain',
      message: rawContent,
      quiz: null,
      quota: { remaining: getQuota(userId), limit: QUOTA_LIMIT }
    });

  } catch (error) {
    // Refund quota on network error
    refundQuota(userId);
    res.status(502).json({
      error: 'Không gọi được LLM endpoint.',
      details: error instanceof Error ? error.message : String(error),
      quota: { remaining: getQuota(userId), limit: QUOTA_LIMIT }
    });
  }
});

// ─── Quiz evaluation endpoint ────────────────────────────────────────────────
app.post('/api/evaluate', async (req, res) => {
  const {
    quizQuestion,
    quizOptions,
    correctIndex,
    selectedIndex,
    citations,
    userId = 'anonymous'
  } = req.body || {};

  // Frontend-only evaluation (correctIndex comes from server-generated quiz)
  const isCorrect = selectedIndex === correctIndex;
  const result = isCorrect ? 'correct' : 'incorrect';

  let newQuota = getQuota(userId);
  if (isCorrect) {
    newQuota = refundQuota(userId);
  }

  // If LLM available, generate richer explanation
  if (process.env.LLM_API_KEY) {
    const baseUrl = (process.env.LLM_API_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const chatPath = process.env.LLM_CHAT_PATH || '/chat/completions';
    const model = process.env.LLM_MODEL || 'inclusionai/ling-3.0-flash:free';

    const evalPrompt = `
=== QUIZ ĐÃ HỎI ===
Câu hỏi: ${quizQuestion}
Các lựa chọn:
${(quizOptions || []).map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}

=== NGUỒN TRANSCRIPT ===
${citations ? JSON.stringify(citations) : 'Không có'}

=== KẾT QUẢ ===
Đáp án đúng: ${String.fromCharCode(65 + correctIndex)}
Học viên chọn: ${String.fromCharCode(65 + selectedIndex)}
Kết quả: ${result}

Hãy giải thích ngắn gọn (≤100 chữ) vì sao đúng hoặc sai, dựa trên transcript. Trả về JSON:
{"explanation": "...", "transcript_reference": "..."}
`;

    try {
      const upstream = await fetch(`${baseUrl}${chatPath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': `http://localhost:${port}`,
          'X-Title': 'VLearn Smart Tutor'
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          messages: [{ role: 'user', content: evalPrompt }]
        })
      });

      if (upstream.ok) {
        const payload = await upstream.json();
        const rawContent = payload?.choices?.[0]?.message?.content || '';
        const parsed = parseLLMOutput(rawContent);
        if (parsed?.explanation) {
          return res.json({
            result,
            explanation: parsed.explanation,
            transcriptReference: parsed.transcript_reference || '',
            quotaAction: isCorrect ? 'refund' : 'none',
            quota: { remaining: newQuota, limit: QUOTA_LIMIT }
          });
        }
      }
    } catch {
      // Fall through to basic evaluation
    }
  }

  // Basic evaluation without LLM
  const explanation = isCorrect
    ? '✅ Chính xác! Câu trả lời của bạn đúng với nội dung bài giảng.'
    : `❌ Chưa chính xác. Đáp án đúng là ${String.fromCharCode(65 + correctIndex)}.`;

  res.json({
    result,
    explanation,
    transcriptReference: '',
    quotaAction: isCorrect ? 'refund' : 'none',
    quota: { remaining: newQuota, limit: QUOTA_LIMIT }
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`VLearn prototype running at http://localhost:${port}`);
  console.log(`LLM: ${process.env.LLM_MODEL || 'mock mode'} via ${process.env.LLM_API_BASE_URL || 'N/A'}`);
});
