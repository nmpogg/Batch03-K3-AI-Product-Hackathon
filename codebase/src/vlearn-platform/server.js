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
  path.join(__dirname, '..', '..', 'data', 'vlearn-pack', 'slide'),
  path.join(__dirname, '..', '..', 'data', 'vlearn-pack', 'slides')
];

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
localSlideDirs.forEach((dir) => {
  app.use('/local-slides', express.static(dir, { fallthrough: true }));
});

function buildMockReply(context) {
  const lesson = context?.lessonTitle || 'bài học hiện tại';
  const slide = context?.slideName || 'slide đang mở';
  const page = context?.page || 1;
  const lessonKey = lesson.toLowerCase();

  let learningContent = {
    summary: [
      'LLM học các mẫu ngôn ngữ từ lượng lớn dữ liệu và tạo câu trả lời bằng cách dự đoán token tiếp theo dựa trên ngữ cảnh.',
      'Chất lượng đầu ra phụ thuộc vào prompt, dữ liệu huấn luyện và phần ngữ cảnh được cung cấp.',
      'Khi xây sản phẩm AI, cần bắt đầu từ một bài toán rõ ràng, có dữ liệu phù hợp và tiêu chí đánh giá đo được.'
    ],
    quiz: {
      question: 'Thao tác cốt lõi của một LLM khi sinh câu trả lời là gì?',
      options: [
        'Tìm nguyên văn câu trả lời trong cơ sở dữ liệu',
        'Dự đoán token tiếp theo từ ngữ cảnh',
        'Thực thi một bộ luật cố định',
        'Luôn tìm kiếm thông tin trên Internet'
      ],
      correctIndex: 1,
      explanation:
        'LLM tạo nội dung tuần tự bằng cách ước lượng xác suất và chọn token tiếp theo dựa trên các token đã có trong ngữ cảnh.'
    }
  };

  if (lessonKey.includes('day 2')) {
    learningContent = {
      summary: [
        'Một bài toán AI tốt phải gắn với nhu cầu người dùng và một quyết định hoặc công việc cụ thể.',
        'Trước khi chọn mô hình, cần xác định dữ liệu đầu vào, đầu ra mong muốn và tiêu chí thành công.',
        'Nên ưu tiên quy trình có tần suất đủ cao, dữ liệu khả dụng và kết quả có thể kiểm chứng.'
      ],
      quiz: {
        question: 'Bước nào nên làm trước khi lựa chọn mô hình AI?',
        options: [
          'Chọn model có nhiều tham số nhất',
          'Thiết kế logo sản phẩm',
          'Xác định bài toán và tiêu chí thành công',
          'Tăng số lượng prompt'
        ],
        correctIndex: 2,
        explanation:
          'Mô hình chỉ là một phần của giải pháp. Bài toán, dữ liệu và tiêu chí thành công phải được xác định trước để chọn công nghệ phù hợp.'
      }
    };
  } else if (lessonKey.includes('agentic')) {
    learningContent = {
      summary: [
        'Chatbot chủ yếu phản hồi hội thoại, còn agentic workflow có thể lập kế hoạch, dùng công cụ và theo dõi trạng thái.',
        'Một agent thường kết hợp LLM, tool, memory và vòng lặp kiểm soát.',
        'Cần giới hạn quyền, theo dõi lỗi và có điểm dừng rõ ràng để workflow vận hành an toàn.'
      ],
      quiz: {
        question: 'Thành phần nào giúp AI agent thực hiện hành động bên ngoài hội thoại?',
        options: ['Temperature', 'Tool', 'Token limit', 'System font'],
        correctIndex: 1,
        explanation:
          'Tool cho phép agent gọi API, truy vấn dữ liệu hoặc thực thi một thao tác; LLM quyết định khi nào và cách dùng tool.'
      }
    };
  } else if (lessonKey.includes('prompt')) {
    learningContent = {
      summary: [
        'Prompt tốt mô tả rõ mục tiêu, ngữ cảnh, ràng buộc và định dạng đầu ra.',
        'Ví dụ mẫu giúp mô hình hiểu chính xác hơn kiểu câu trả lời mong muốn.',
        'Prompt cần được kiểm thử trên nhiều tình huống thay vì tối ưu cho một ví dụ duy nhất.'
      ],
      quiz: {
        question: 'Thành phần nào giúp đầu ra của LLM nhất quán và dễ sử dụng hơn?',
        options: [
          'Yêu cầu một định dạng đầu ra rõ ràng',
          'Luôn tăng temperature',
          'Bỏ toàn bộ ngữ cảnh',
          'Chỉ dùng prompt một từ'
        ],
        correctIndex: 0,
        explanation:
          'Định dạng đầu ra rõ ràng như JSON, bảng hoặc cấu trúc mục giúp giảm mơ hồ và làm kết quả dễ xử lý hơn.'
      }
    };
  } else if (lessonKey.includes('evaluation') || lessonKey.includes('validation')) {
    learningContent = {
      summary: [
        'Đánh giá sản phẩm AI cần một tập tình huống đại diện, tiêu chí chấm rõ ràng và log kết quả.',
        'Golden set giúp so sánh các phiên bản prompt hoặc model theo cùng một chuẩn.',
        'Đánh giá tự động nên đi cùng phản hồi người dùng và kiểm tra thủ công cho các trường hợp rủi ro.'
      ],
      quiz: {
        question: 'Golden set được dùng chủ yếu để làm gì?',
        options: [
          'Lưu API key',
          'So sánh chất lượng trên một tập tình huống chuẩn',
          'Tăng tốc độ mạng',
          'Thiết kế giao diện'
        ],
        correctIndex: 1,
        explanation:
          'Golden set là tập ví dụ chuẩn có kết quả hoặc tiêu chí mong đợi, giúp đo và so sánh chất lượng một cách nhất quán.'
      }
    };
  } else if (lessonKey.includes('demo')) {
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

app.get('/api/config', (_req, res) => {
  res.json({
    llmConfigured: Boolean(process.env.LLM_API_KEY),
    model: process.env.LLM_MODEL || null
  });
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
  const { messages = [], context = {} } = req.body || {};

  if (!process.env.LLM_API_KEY) {
    const fallback = buildMockReply(context);
    return res.json({
      mode: 'mock',
      message: fallback.message,
      quiz: fallback.quiz
    });
  }

  const baseUrl = (process.env.LLM_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const chatPath = process.env.LLM_CHAT_PATH || '/chat/completions';
  const model = process.env.LLM_MODEL || 'gpt-4.1-mini';
  const temperature = Number(process.env.LLM_TEMPERATURE || 0.2);
  const systemPrompt =
    process.env.LLM_SYSTEM_PROMPT ||
    'Bạn là VLearn Tutor. Trả lời bằng tiếng Việt, ngắn gọn, bám sát ngữ cảnh bài học.';

  const upstreamMessages = [
    {
      role: 'system',
      content: [
        systemPrompt,
        '',
        'Ngữ cảnh học tập:',
        `- Khóa học: ${context.courseTitle || 'AI thực chiến K3'}`,
        `- Bài học: ${context.lessonTitle || 'chưa rõ'}`,
        `- Tài liệu: ${context.slideName || 'chưa rõ'}`,
        `- Trang: ${context.page || 'chưa rõ'}`,
        context.selection ? `- Đoạn được bôi đen: ${context.selection}` : ''
      ]
        .filter(Boolean)
        .join('\n')
    },
    ...messages.slice(-10).map(({ role, content }) => ({ role, content }))
  ];

  try {
    const upstream = await fetch(`${baseUrl}${chatPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: upstreamMessages
      })
    });

    const payload = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: payload?.error?.message || 'LLM request failed',
        details: payload
      });
    }

    res.json({
      mode: 'llm',
      message: payload?.choices?.[0]?.message?.content || 'Không nhận được nội dung trả lời từ LLM.'
    });
  } catch (error) {
    res.status(502).json({
      error: 'Không gọi được LLM endpoint.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`VLearn prototype running at http://localhost:${port}`);
});
