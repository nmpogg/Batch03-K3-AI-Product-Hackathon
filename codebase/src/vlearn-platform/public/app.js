const course = {
  id: 'ai-thuc-chien-k3',
  provider: 'VLearn · VinUni AI thực chiến',
  title: 'AI thực chiến K3',
  code: 'COMP2010 - Khóa 3 + 4 Phase 1',
  learners: 1074,
  completedDays: 0,
  totalDays: 6,
  description: 'Khóa học thực hành xây sản phẩm AI: từ LLM foundation, xác định bài toán, prompt engineering, agentic workflow đến prototype và validation.',
  lessons: [
    {
      day: 1,
      title: 'Day 1',
      topic: 'AI & LLM Foundation',
      status: 'Chưa hoàn thành',
      slides: [
        { name: 'day01_302.pdf', pages: 83, kind: 'mock' },
        { name: 'material_mrxpq9zu_t8e6xs.pdf', pages: 32, kind: 'mock' }
      ]
    },
    {
      day: 2,
      title: 'Day 2',
      topic: 'Xác định bài toán AI',
      status: 'Chưa hoàn thành',
      slides: [{ name: 'day02-problem-framing.pdf', pages: 54, kind: 'mock' }]
    },
    {
      day: 3,
      title: 'Day 3',
      topic: 'Từ chatbot đến agentic workflow',
      status: 'Chưa hoàn thành',
      slides: [
        { name: 'day03-tu-chatbot-den-agentic-workflow.pdf', pages: 61, kind: 'mock' },
        { name: 'Day03-D302-tu-chatbot-den-agent.pdf', pages: 42, kind: 'mock' }
      ]
    },
    {
      day: 4,
      title: 'Day 4',
      topic: 'Prompt engineering tool use',
      status: 'Chưa hoàn thành',
      slides: [
        { name: 'day04-prompt-engineering-tool-use.pdf', pages: 70, kind: 'mock' },
        { name: 'day04-prompt-engineering-tool-eval.pdf', pages: 45, kind: 'mock' },
        { name: 'day04-prompt-engineering-tool-lab.pdf', pages: 28, kind: 'mock' }
      ]
    },
    {
      day: 5,
      title: 'Day 5',
      topic: 'Evaluation & validation',
      status: 'Chưa hoàn thành',
      slides: [
        { name: 'day05-evaluation-validation.pdf', pages: 48, kind: 'mock' },
        { name: 'day05-golden-set.pdf', pages: 26, kind: 'mock' },
        { name: 'day05-user-test-log.pdf', pages: 18, kind: 'mock' }
      ]
    },
    {
      day: 6,
      title: 'Day 6',
      topic: 'Demo sản phẩm AI',
      status: 'Chưa hoàn thành',
      slides: [{ name: 'day06-demo-readiness.pdf', pages: 36, kind: 'mock' }]
    }
  ]
};

const state = {
  view: 'catalog',
  activeLessonIndex: 0,
  activeSlideIndex: 0,
  activePage: 1,
  chatCollapsed: false,
  chatWidth: 380,
  uploadUrl: null,
  selectedText: '',
  userId: 'user-' + Math.random().toString(36).slice(2, 10),
  quota: { remaining: 15, limit: 15 },
  messages: [
    {
      role: 'assistant',
      content: 'Xin chào! Mình là VLearn Tutor 🎓\n\nMình có thể giải thích nội dung từ 6 buổi học dựa trên transcript và sinh câu hỏi kiểm tra hiểu bài. Trả lời đúng → hoàn lại 1 lượt hỏi!\n\nBôi đen một đoạn trên slide hoặc gõ câu hỏi bên dưới nhé.'
    }
  ]
};

const app = document.querySelector('#app');

function icon(name, size = 18) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`;
}

function currentLesson() {
  return course.lessons[state.activeLessonIndex];
}

function currentSlide() {
  return currentLesson().slides[state.activeSlideIndex];
}

function setView(view) {
  state.view = view;
  render();
}

function openReader(lessonIndex = state.activeLessonIndex, slideIndex = 0) {
  state.activeLessonIndex = lessonIndex;
  state.activeSlideIndex = slideIndex;
  state.activePage = 1;
  setView('reader');
}

function activateSlide(lessonIndex, slideIndex) {
  state.activeLessonIndex = lessonIndex;
  state.activeSlideIndex = slideIndex;
  state.activePage = 1;
  render();
}

function renderShell(content, active = 'courses') {
  return `
    <div class="app-shell">
      <header class="topbar">
        <button class="brand" data-action="catalog" aria-label="VLearn home">
          <span class="brand-mark"></span>
          <span class="brand-name"><strong>V</strong>Learn</span>
        </button>
        <nav class="nav" aria-label="Điều hướng chính">
          <button class="nav-item ${active === 'home' ? 'active' : ''}" data-action="catalog">${icon('home')} Trang chủ</button>
          <button class="nav-item ${active === 'courses' ? 'active' : ''}" data-action="detail">${icon('book-open')} Khóa học của tôi</button>
          <button class="nav-item ${active === 'notes' ? 'active' : ''}">${icon('notebook-tabs')} Sổ tay học tập</button>
        </nav>
        <div class="top-actions">
          <button class="pill dashed">${icon('external-link')} Mở Codelabs</button>
          <button class="icon-btn" aria-label="Ngôn ngữ">VI</button>
          <button class="icon-btn" aria-label="Dark mode">${icon('moon')}</button>
          <button class="pill"><strong>2</strong> 26ai.trangnt2@vinuni.edu.vn ${icon('chevron-down', 16)}</button>
        </div>
      </header>
      ${content}
    </div>
  `;
}

function renderCatalog() {
  const content = `
    <main class="page">
      <section class="course-header">
        <div>
          <p class="eyebrow">VLearn · Course Platform</p>
          <h1>Khóa học của tôi</h1>
          <p class="subtle">Chọn khóa học để vào danh sách bài học, đọc slide và hỏi VLearn Tutor theo ngữ cảnh.</p>
        </div>
      </section>
      <section class="catalog-grid">
        <article class="course-card">
          <div class="course-cover">
            <div class="course-cover-title">AI<br />thực chiến<br />K3</div>
          </div>
          <div>
            <p class="eyebrow">${course.provider}</p>
            <h2>${course.code}</h2>
            <p class="subtle">${course.description}</p>
          </div>
          <div class="metric-row">
            <span class="metric">${course.learners.toLocaleString('vi-VN')} học viên</span>
            <span class="metric">${course.totalDays} ngày học</span>
            <span class="metric">${course.completedDays}/${course.totalDays} hoàn thành</span>
          </div>
          <button class="primary-btn" data-action="detail">${icon('book-open')} Chọn khóa học</button>
        </article>
      </section>
    </main>
  `;
  return renderShell(content, 'courses');
}

function renderCourseDetail() {
  const lessons = course.lessons
    .map((lesson, lessonIndex) => {
      const chips = lesson.slides
        .map(
          (slide, slideIndex) => `
            <button class="file-chip" data-action="open-slide" data-lesson="${lessonIndex}" data-slide="${slideIndex}">
              ${icon('file-text', 17)}
              <span>${slide.name}</span>
            </button>
          `
        )
        .join('');

      return `
        <article class="lesson-card">
          <div class="day-badge"><span>Day</span>${String(lesson.day).padStart(2, '0')}</div>
          <div>
            <div class="lesson-title">${lesson.title}</div>
            <div class="lesson-status">${lesson.status}</div>
          </div>
          <button class="ghost-btn" data-action="open-reader" data-lesson="${lessonIndex}">
            ${icon('file-text')} Đọc Slide
          </button>
          <div class="slide-picker">
            <div class="slide-picker-label">Chọn slide khác (${lesson.slides.length})</div>
            ${chips}
          </div>
        </article>
      `;
    })
    .join('');

  const content = `
    <main class="page">
      <section class="course-header">
        <div>
          <p class="eyebrow">${course.provider}</p>
          <h1>${course.code}</h1>
          <p class="subtle">${course.learners.toLocaleString('vi-VN')} học viên cùng lớp · ${course.completedDays}/${course.totalDays} ngày đã hoàn thành</p>
        </div>
        <button class="primary-btn" data-action="open-reader" data-lesson="0">${icon('play')} Bắt đầu đọc</button>
      </section>
      <section class="course-layout">
        <div class="lesson-list">${lessons}</div>
        <aside class="progress-card">
          <h2>Tiến độ cá nhân</h2>
          <div class="progress-bar"><div class="progress-fill"></div></div>
          <p class="subtle">Bạn đã hoàn thành <strong>${course.completedDays}</strong> trên tổng số <strong>${course.totalDays}</strong> ngày học của học phần này.</p>
        </aside>
      </section>
    </main>
  `;
  return renderShell(content, 'courses');
}

function renderMaterials() {
  return course.lessons
    .map((lesson, lessonIndex) => {
      const docs = lesson.slides
        .map(
          (slide, slideIndex) => `
            <button class="doc-item ${lessonIndex === state.activeLessonIndex && slideIndex === state.activeSlideIndex ? 'active' : ''}"
              data-action="activate-slide" data-lesson="${lessonIndex}" data-slide="${slideIndex}">
              ${icon('play-circle', 18)}
              <span>
                <span class="doc-name">${slide.name}</span>
                <span class="doc-pages">${slide.pages || '?'} trang</span>
              </span>
              ${lessonIndex === state.activeLessonIndex && slideIndex === state.activeSlideIndex ? icon('check-circle', 18) : ''}
            </button>
          `
        )
        .join('');

      return `
        <section class="day-group">
          <div class="day-group-head">
            <span>${lesson.title}</span>
            <span class="day-meta">${lesson.slides.length} tài liệu · active</span>
          </div>
          <div class="doc-list">${docs}</div>
        </section>
      `;
    })
    .join('');
}

function renderMockSlides() {
  const slide = currentSlide();
  const lesson = currentLesson();

  return `
    <article class="slide-page ${state.activePage === 1 ? 'active' : ''}" data-page="1">
      <div class="page-caption"><span>Trang 1 / ${slide.pages}</span><span>${slide.name}</span></div>
      <div class="cover-slide">
        <div class="cover-panel">
          <strong>AI IN ACTION - Day ${lesson.day}</strong>
          <h2>${lesson.topic}</h2>
          <p>Bạn đang dùng AI mỗi ngày - nhưng thực sự bên trong nó đang làm gì?</p>
          <small>Instructor: Mai Anh Nguyen (Blue)</small>
        </div>
      </div>
      <div class="watermark">26AI.TRANGNT2@VINUNI.EDU.VN</div>
    </article>
    <article class="slide-page ${state.activePage === 2 ? 'active' : ''}" data-page="2">
      <div class="page-caption"><span>Trang 2 / ${slide.pages}</span><span>${slide.name}</span></div>
      <h2>Instructor</h2>
      <div class="instructor-card">
        <div class="avatar">BLUE</div>
        <div>
          <h3>Mai Anh Nguyen (Blue)</h3>
          <p>Generalist Product Builder</p>
          <p>2026 · FPT Long Châu (PM · Healthcare Product)</p>
          <p>2025 · Product builder cho AI agent và workflow tự động hóa</p>
          <p>2021 - 2025 · On-chain Analytics, AI Agent</p>
        </div>
      </div>
      <div class="watermark">26AI.TRANGNT2@VINUNI.EDU.VN</div>
    </article>
    <article class="slide-page ${state.activePage === 3 ? 'active' : ''}" data-page="3">
      <div class="page-caption"><span>Trang 3 / ${slide.pages}</span><span>${slide.name}</span></div>
      <h2>Khung học thực chiến</h2>
      <div class="bullet-grid">
        <div class="slide-note">
          <h3>1. Hiểu mô hình</h3>
          <p>LLM dự đoán token kế tiếp dựa trên ngữ cảnh, attention và dữ liệu huấn luyện.</p>
        </div>
        <div class="slide-note">
          <h3>2. Đóng gói bài toán</h3>
          <p>Chọn việc có tần suất cao, dữ liệu rõ và tiêu chí đánh giá được.</p>
        </div>
        <div class="slide-note">
          <h3>3. Thiết kế tutor</h3>
          <p>Tutor cần biết khóa học, bài học, slide, trang và đoạn người học đang hỏi.</p>
        </div>
        <div class="slide-note">
          <h3>4. Đo chất lượng</h3>
          <p>Dùng golden set, log câu hỏi, quota, feedback và kết quả user test.</p>
        </div>
      </div>
      <div class="watermark">26AI.TRANGNT2@VINUNI.EDU.VN</div>
    </article>
  `;
}

function renderViewerBody() {
  const slide = currentSlide();
  if (slide.url) {
    return `<iframe class="pdf-embed" src="${slide.url}" title="${slide.name}"></iframe>`;
  }

  return renderMockSlides();
}

function renderQuiz(quiz, messageIndex) {
  const hasAnswered = Number.isInteger(quiz.selectedIndex);
  const isCorrect = hasAnswered && quiz.selectedIndex === quiz.correctIndex;
  const options = quiz.options
    .map((option, optionIndex) => {
      const classes = ['quiz-option'];
      if (hasAnswered && optionIndex === quiz.correctIndex) classes.push('correct');
      if (hasAnswered && optionIndex === quiz.selectedIndex && !isCorrect) classes.push('incorrect');
      if (hasAnswered && optionIndex === quiz.selectedIndex) classes.push('selected');

      return `
        <button
          class="${classes.join(' ')}"
          data-action="answer-quiz"
          data-message="${messageIndex}"
          data-option="${optionIndex}"
          ${hasAnswered ? 'disabled' : ''}
        >
          <span class="quiz-option-key">${String.fromCharCode(65 + optionIndex)}</span>
          <span>${escapeHtml(option)}</span>
          ${hasAnswered && optionIndex === quiz.correctIndex ? icon('check-circle-2', 17) : ''}
          ${hasAnswered && optionIndex === quiz.selectedIndex && !isCorrect ? icon('x-circle', 17) : ''}
        </button>
      `;
    })
    .join('');

  const feedback = hasAnswered
    ? `
      <div class="quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}" role="status">
        <strong>${isCorrect ? 'Chính xác! ✅ +1 lượt hoàn lại' : 'Chưa chính xác ❌'}</strong>
        <p>${escapeHtml(quiz.serverExplanation || quiz.explanation)}</p>
      </div>
    `
    : '';

  return `
    <section class="inline-quiz">
      <div class="quiz-label">${icon('circle-help', 16)} Kiểm tra nhanh</div>
      <h3>${escapeHtml(quiz.question)}</h3>
      <div class="quiz-options">${options}</div>
      ${feedback}
    </section>
  `;
}

function renderChatMessages() {
  return state.messages
    .map(
      (message, messageIndex) => `
        <div class="message ${message.role === 'user' ? 'user' : ''} ${message.quiz ? 'quiz-message' : ''}">
          <div class="message-content">${escapeHtml(message.content)}</div>
          ${message.quiz ? renderQuiz(message.quiz, messageIndex) : ''}
        </div>
      `
    )
    .join('');
}

function renderReader() {
  const lesson = currentLesson();
  const slide = currentSlide();
  const collapsed = state.chatCollapsed ? 'chat-collapsed' : '';

  return `
    <div class="reader ${collapsed}" style="--chat-width:${state.chatWidth}px">
      <header class="reader-topbar">
        <button class="icon-btn" data-action="detail" aria-label="Quay lại">${icon('chevron-left')}</button>
        <button class="brand" data-action="detail" aria-label="VLearn">
          <span class="brand-mark"></span>
          <span class="brand-name"><strong>V</strong>Learn</span>
        </button>
        <div class="reader-title">
          <h1>${slide.name}</h1>
          <p>${course.code} · Lecture_material_mock</p>
        </div>
        <div class="top-actions reader-actions">
          <button class="icon-btn" aria-label="Ngôn ngữ">VI</button>
          <button class="icon-btn" aria-label="Dark mode">${icon('moon')}</button>
          <button class="pill">${icon('user-round')} Sinh viên ẩn danh</button>
        </div>
      </header>
      <div class="reader-layout">
        <aside class="materials">
          <div class="materials-head">
            <button class="icon-btn" aria-label="Học liệu">${icon('book-open')}</button>
            <div>
              <h2>Học liệu môn học</h2>
              <p>Chương, slide và tài liệu đã upload</p>
            </div>
          </div>
          ${renderMaterials()}
        </aside>
        <main class="viewer">
          <div class="viewer-toolbar">
            <button class="tool-btn active">${icon('mouse-pointer-2')} Đọc</button>
            <button class="tool-btn">${icon('pencil')} Bút</button>
            <button class="tool-btn">${icon('highlighter')} Highlight</button>
            <button class="tool-btn" aria-label="Thêm">${icon('more-horizontal')}</button>
            <div class="toolbar-divider"></div>
            <button class="tool-btn">Trang ${state.activePage} · 1 note</button>
            <button class="tool-btn">${icon('minus')} 100% ${icon('plus')}</button>
            <div class="toolbar-divider"></div>
            <label class="upload-label">
              ${icon('upload')} Upload slide
              <input type="file" accept="application/pdf" data-action="upload-pdf" />
            </label>
            <button class="tool-btn" data-action="download-mock">${icon('download')}</button>
          </div>
          <button class="edge-nav left" data-action="prev-page" aria-label="Trang trước">${icon('chevron-left')}</button>
          <button class="edge-nav right" data-action="next-page" aria-label="Trang sau">${icon('chevron-right')}</button>
          <div class="viewer-scroll" id="viewer-scroll">${renderViewerBody()}</div>
          <div class="bottom-pager">
            <button class="icon-btn" data-action="prev-page" aria-label="Trang trước">${icon('chevron-left')}</button>
            <strong>Trang&nbsp; ${state.activePage} &nbsp;/&nbsp; ${slide.pages || '?'}</strong>
            <button class="icon-btn" data-action="next-page" aria-label="Trang sau">${icon('chevron-right')}</button>
          </div>
        </main>
        <div class="chat-resizer" data-action="resize-chat" title="Kéo để đổi chiều rộng tutor"></div>
        <aside class="chat">
          <div class="chat-head">
            <button class="icon-btn" aria-label="Tutor">${icon('bot')}</button>
            <div>
              <h2>VLearn Tutor</h2>
              <span class="status-dot">Trợ lý học theo ngữ cảnh</span>
            </div>
            <button class="icon-btn" data-action="toggle-chat" aria-label="Thu gọn tutor">${icon(state.chatCollapsed ? 'panel-right-open' : 'panel-right-close')}</button>
            <button class="icon-btn" data-action="new-chat" aria-label="Hội thoại mới">${icon('plus')}</button>
          </div>
          <div class="chat-quota">
            <div class="quota-row"><span>Lượt hỏi còn lại hôm nay</span><span>${state.quota.remaining} / ${state.quota.limit}</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Math.round((state.quota.remaining / state.quota.limit) * 100)}%"></div></div>
          </div>
          <div class="chat-body" id="chat-body">
            <div class="context-label">Ngữ cảnh: ${slide.name} · trang ${state.activePage}${state.selectedText ? ' · đã bôi đen' : ''}</div>
            ${renderChatMessages()}
          </div>
          <form class="chat-input" data-action="chat-form">
            <textarea name="message" rows="1" placeholder="Nhập câu hỏi hoặc bôi đen tài liệu..."></textarea>
            <button class="send-btn" type="submit" aria-label="Gửi">${icon('send')}</button>
          </form>
        </aside>
      </div>
    </div>
  `;
}

function render() {
  if (state.view === 'catalog') app.innerHTML = renderCatalog();
  if (state.view === 'detail') app.innerHTML = renderCourseDetail();
  if (state.view === 'reader') app.innerHTML = renderReader();

  if (window.lucide) window.lucide.createIcons();
  bindAfterRender();
}

function bindAfterRender() {
  const chatBody = document.querySelector('#chat-body');
  if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;

  const viewer = document.querySelector('#viewer-scroll');
  if (viewer) {
    viewer.addEventListener('scroll', () => {
      const pages = [...viewer.querySelectorAll('.slide-page')];
      if (!pages.length) return;
      const nearest = pages
        .map((page) => ({ page, distance: Math.abs(page.getBoundingClientRect().top - viewer.getBoundingClientRect().top) }))
        .sort((a, b) => a.distance - b.distance)[0]?.page;
      const pageNumber = Number(nearest?.dataset.page || state.activePage);
      if (pageNumber !== state.activePage) {
        state.activePage = pageNumber;
        updateContextOnly();
      }
    });
  }
}

function updateContextOnly() {
  const label = document.querySelector('.context-label');
  const slide = currentSlide();
  if (label) label.textContent = `Ngữ cảnh: ${slide.name} · trang ${state.activePage}${state.selectedText ? ' · đã bôi đen' : ''}`;
  document.querySelectorAll('.bottom-pager strong').forEach((node) => {
    node.textContent = `Trang  ${state.activePage}  /  ${slide.pages || '?'}`;
  });
}

function nextPage(delta) {
  const slide = currentSlide();
  const maxPage = slide.kind === 'upload' ? slide.pages || 1 : Math.min(slide.pages || 3, 3);
  state.activePage = Math.max(1, Math.min(maxPage, state.activePage + delta));

  const viewer = document.querySelector('#viewer-scroll');
  const target = viewer?.querySelector(`[data-page="${state.activePage}"]`);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  render();
}

function handleUpload(file) {
  if (!file) return;
  if (state.uploadUrl) URL.revokeObjectURL(state.uploadUrl);
  state.uploadUrl = URL.createObjectURL(file);
  const lesson = currentLesson();
  lesson.slides.unshift({
    name: file.name,
    pages: '?',
    kind: 'upload',
    url: state.uploadUrl
  });
  state.activeSlideIndex = 0;
  state.activePage = 1;
  toast(`Đã upload ${file.name}`);
  render();
}

async function sendChat(form) {
  const textarea = form.querySelector('textarea');
  const value = textarea.value.trim();
  if (!value) return;

  // Optimistic quota check
  if (state.quota.remaining <= 0) {
    toast('⏰ Hết lượt hỏi hôm nay! Trả lời đúng quiz để nhận lại lượt.');
    return;
  }

  state.messages.push({ role: 'user', content: value });
  textarea.value = '';
  // Show loading indicator
  state.messages.push({ role: 'assistant', content: '...', loading: true });
  render();

  const context = {
    courseTitle: course.title,
    lessonTitle: `${currentLesson().title}: ${currentLesson().topic}`,
    slideName: currentSlide().name,
    page: state.activePage,
    selection: state.selectedText
  };

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: state.messages.filter(m => !m.loading), context, userId: state.userId })
    });
    const payload = await response.json();
    // Remove loading message
    state.messages = state.messages.filter(m => !m.loading);
    state.messages.push({
      role: 'assistant',
      content: payload.message || payload.error || 'Tutor chưa có phản hồi.',
      quiz: payload.quiz ? { ...payload.quiz, _citations: payload.citations } : null,
      intent: payload.intent
    });
    // Update quota from server response
    if (payload.quota) state.quota = payload.quota;
  } catch {
    state.messages = state.messages.filter(m => !m.loading);
    state.messages.push({
      role: 'assistant',
      content: 'Không kết nối được server local. Nếu bạn mở file HTML trực tiếp, hãy chạy `npm run dev` để dùng chatbot.'
    });
  }

  render();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toast(message) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2400);
}

function startResize(event) {
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = state.chatWidth;

  function onMove(moveEvent) {
    const delta = startX - moveEvent.clientX;
    state.chatWidth = Math.max(300, Math.min(620, startWidth + delta));
    document.querySelector('.reader')?.style.setProperty('--chat-width', `${state.chatWidth}px`);
  }

  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  if (action === 'catalog') setView('catalog');
  if (action === 'detail') setView('detail');
  if (action === 'open-reader') openReader(Number(target.dataset.lesson || 0), 0);
  if (action === 'open-slide') openReader(Number(target.dataset.lesson || 0), Number(target.dataset.slide || 0));
  if (action === 'activate-slide') activateSlide(Number(target.dataset.lesson || 0), Number(target.dataset.slide || 0));
  if (action === 'prev-page') nextPage(-1);
  if (action === 'next-page') nextPage(1);
  if (action === 'answer-quiz') {
    const message = state.messages[Number(target.dataset.message)];
    if (message?.quiz && !Number.isInteger(message.quiz.selectedIndex)) {
      const selectedIndex = Number(target.dataset.option);
      message.quiz.selectedIndex = selectedIndex;
      render(); // optimistic render
      // Call /api/evaluate for server-side grading
      try {
        const evalRes = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizQuestion: message.quiz.question,
            quizOptions: message.quiz.options,
            correctIndex: message.quiz.correctIndex,
            selectedIndex,
            citations: message.quiz._citations || [],
            userId: state.userId
          })
        });
        const evalPayload = await evalRes.json();
        // Update quiz with server explanation
        if (evalPayload.explanation) {
          message.quiz.serverExplanation = evalPayload.explanation;
        }
        if (evalPayload.quota) {
          state.quota = evalPayload.quota;
          if (evalPayload.quotaAction === 'refund') toast('✅ Đúng! Hoàn lại 1 lượt hỏi 🎉');
        }
        render();
      } catch {
        // Use local correctIndex fallback, already rendered
      }
    }
  }
  if (action === 'toggle-chat') {
    state.chatCollapsed = !state.chatCollapsed;
    render();
  }
  if (action === 'new-chat') {
    state.messages = [{ role: 'assistant', content: 'Mình đã mở một hội thoại mới cho slide hiện tại.' }];
    render();
  }
  if (action === 'download-mock') toast('Prototype đang dùng slide mock trong HTML.');
});

document.addEventListener('change', (event) => {
  const input = event.target.closest('[data-action="upload-pdf"]');
  if (input) handleUpload(input.files?.[0]);
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-action="chat-form"]');
  if (!form) return;
  event.preventDefault();
  sendChat(form);
});

document.addEventListener('input', (event) => {
  const textarea = event.target.closest('.chat-input textarea');
  if (!textarea) return;
  textarea.parentElement.querySelector('.send-btn')?.classList.toggle('ready', Boolean(textarea.value.trim()));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && event.target.matches('.chat-input textarea')) {
    event.preventDefault();
    event.target.closest('form')?.requestSubmit();
  }
});

document.addEventListener('selectionchange', () => {
  if (state.view !== 'reader') return;
  const selection = window.getSelection()?.toString().trim() || '';
  if (selection.length > 2) {
    state.selectedText = selection.slice(0, 800);
    updateContextOnly();
  }
});

document.addEventListener('mousedown', (event) => {
  const handle = event.target.closest('[data-action="resize-chat"]');
  if (handle) startResize(event);
});

async function hydrateLocalSlides() {
  try {
    const response = await fetch('/api/local-slides');
    if (!response.ok) return;
    const payload = await response.json();
    const localSlides = Array.isArray(payload.slides) ? payload.slides : [];
    const dayOne = course.lessons[0];

    localSlides.reverse().forEach((slide) => {
      const exists = dayOne.slides.some((item) => item.name === slide.name);
      if (!exists) {
        dayOne.slides.unshift({
          ...slide,
          kind: 'local'
        });
      }
    });

    if (localSlides.length) render();
  } catch {
    // Opening index.html without the Node server still works with mock slides.
  }
}

render();
hydrateLocalSlides();
