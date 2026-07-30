# VLearn Platform Prototype

Prototype HTML/CSS/JS cho platform học tập VLearn: chọn khóa học, xem danh sách bài học, đọc slide/mock PDF, upload PDF từ máy, và chat với tutor bên phải.

## Chạy local

```bash
npm install
cp .env.example .env
npm run dev
```

Mở `http://localhost:5173`.

Nếu chưa điền `LLM_API_KEY`, chatbot tự trả lời bằng mock. Khi muốn dùng LLM thật, sửa `.env`:

```env
LLM_API_BASE_URL=https://api.openai.com/v1
LLM_CHAT_PATH=/chat/completions
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4.1-mini
```

Endpoint hiện dùng chuẩn OpenAI-compatible Chat Completions để dễ đổi provider. Không commit file `.env`.

## Phần mock

- Khóa học: `AI thực chiến K3`.
- Bài học: Day 1 đến Day 6, mock sẵn file slide giống ảnh mẫu.
- Slide viewer: dựng HTML giả lập trang PDF; khi upload PDF, browser sẽ embed file đó vào vùng đọc.
- Nếu có PDF trong `data/vlearn-pack/slide/` hoặc `data/vlearn-pack/slides/`, server sẽ tự đưa vào Day 1 mà không copy/commit file PDF.
- Chatbot: có context theo khóa học, bài học, tài liệu, trang hiện tại và đoạn người học bôi đen.
