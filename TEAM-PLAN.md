# 📋 KẾ HOẠCH NHÓM — AI Tutor VLearn Nâng Cao
> Hackathon AI · Hướng A · Tính năng mới + Tối ưu tutor · 4 người

---

## 🎯 Mô tả sản phẩm

**VLearn Smart Tutor** — AI tutor hỗ trợ học viên trong nền tảng VLearn với các tính năng:

| # | Tính năng | Nguồn |
|---|---|---|
| 1 | Trả lời câu hỏi kèm trích dẫn đoạn transcript [buổi N · đoạn M] | Đề bài gốc |
| 2 | Hỏi về nội dung trao đổi giảng viên–học viên trong buổi học hôm đó | **Bổ sung mới** |
| 3 | Sau mỗi giải thích, AI tự sinh 1 câu hỏi kiểm tra | **Bổ sung mới** |
| 4 | Hệ thống lượt hỏi: giới hạn 15 lượt/ngày · trả lời đúng câu hỏi AI → hoàn 1 lượt | **Bổ sung mới** |

**Lát cắt MỘT CÂU:**
> Học viên đang ôn lại bài sau buổi học → hỏi AI tutor về khái niệm chưa rõ → AI giải thích có trích dẫn transcript + đặt câu hỏi kiểm tra → học viên trả lời đúng → nhận lại 1 lượt hỏi.

---

## 👥 Phân công 4 người

| Vai | Tên | Trách nhiệm chính |
|---|---|---|
| **Person A** — Evidence & Spec | _(tên)_ | Mining chatlog · khảo sát ≥20 người · viết spec §1-§3 · bảng impact |
| **Person B** — Prompt & AI Logic | _(tên)_ | Thiết kế prompt hệ thống · logic 4 tính năng · golden set ≥20 case · eval/ |
| **Person C** — Build (Frontend + Flow) | _(tên)_ | Giao diện chat · hiển thị lượt hỏi · flow câu hỏi kiểm tra · trích dẫn |
| **Person D** — Spec §4-§9 & Validation | _(tên)_ | Viết spec §4-§9 · tổ chức user test · feedback log · slide demo |

> ⚠️ **Vibe-coding rule**: mỗi người phải giải thích được **toàn bộ phần có tên mình** tại CP5/CP6.

---

## ⏱️ Timeline 6 Mốc (Khoá 3)

### ✅ CP1 · Canvas — 10:00 Ngày 1
**Mục tiêu:** Chốt hướng, pain, lát cắt, phân công.

| Việc | Người | Deadline |
|---|---|---|
| Đọc chatlog, chọn **3 pain ứng viên** từ data | A | Trước CP1 |
| Viết Canvas 7 dòng (template §1.5) | D | Trước CP1 |
| Xác định ≥3 willing users sẽ test | D | Trước CP1 |
| Phân công cụ thể có tên người | Cả nhóm | Trước CP1 |

**Canvas cần show:**
```
Hướng: A — VLearn · Tính năng mới
Job executor: Học viên đang ôn bài sau buổi học
Pain 1 câu: Học viên hỏi AI tutor nhưng không biết mình hiểu đúng không → không củng cố được kiến thức
Bằng chứng đầu: [mining chatlog sơ bộ]
Lát cắt: [1 user · 1 việc · 1 quyết định AI · 1 kết quả]
Automation: Conditional — AI tự trả lời khi có căn cứ transcript, từ chối khi ngoài phạm vi
Willing users: [tên 1], [tên 2], [tên 3]
```

---

### ✅ CP2 · Bấm được — 12:00 Ngày 1
**Mục tiêu:** Flow chính bấm đi hết được + commit đầu tiên.

| Việc | Người | Deadline |
|---|---|---|
| Dựng giao diện chat cơ bản (v0.dev hoặc HTML/React) | C | 11:30 N1 |
| Hiển thị số lượt hỏi còn lại (UI mock) | C | 11:30 N1 |
| Mock flow: gõ câu hỏi → hiện câu trả lời giả + câu hỏi AI giả | C | 11:30 N1 |
| Commit đầu vào repo nhóm | C | 12:00 N1 |
| Prompt nháp cho tính năng giải thích + câu hỏi kiểm tra | B | 11:30 N1 |

**Luồng cần bấm được:**
```
[Nhập câu hỏi] → [Xem giải thích + trích dẫn] → [Xem câu hỏi kiểm tra] → [Nhập trả lời] → [Xem kết quả + cập nhật lượt]
```

---

### ✅ CP3 · AI thật + đo lượt đầu — 16:00 Ngày 1
**Mục tiêu:** AI gọi thật ở quyết định trung tâm + golden set ≥20 + bảng kết quả lượt 1.

| Việc | Người | Deadline |
|---|---|---|
| Tích hợp API call thật (Gemini/GPT) vào flow giải thích | B + C | 15:00 N1 |
| Hoàn thiện prompt: giải thích + trích dẫn transcript + sinh câu hỏi | B | 14:00 N1 |
| Prompt đánh giá câu trả lời của học viên (đúng/sai/gần đúng) | B | 14:30 N1 |
| Logic cộng trừ lượt hỏi | C | 15:00 N1 |
| Xây golden set ≥20 case (bảng trong eval/) | B + A | 15:30 N1 |
| Chạy lượt đo đầu tiên, lập bảng % | B | 16:00 N1 |
| Log/trace API call giữ trong repo | B | 16:00 N1 |

**Cơ cấu golden set:**

| Loại | Số case |
|---|---|
| Case thường (hỏi về khái niệm trong transcript) | 8–10 |
| Case chỗ khó ① Nguồn sự thật (AI bịa transcript) | ≥2 |
| Case chỗ khó ② Mơ hồ / câu hỏi thiếu thông tin | ≥2 |
| Case chỗ khó ③ Ngoài phạm vi (hỏi điều không liên quan) | ≥2 |
| Case chỗ khó ④ Đặc thù domain (câu hỏi sai kiến thức) | ≥2 |
| Case hiếm (hỏi về buổi học hôm đó chưa có transcript) | 2–4 |
| **Tổng** | **≥20** |

---

### ✅ CP4 · Chốt tiến độ — 17:30 Ngày 1 *(spec.md commit 23:59)*
**Mục tiêu:** Spec gần xong, quality bar chốt, evidence đạt chuẩn.

| Việc | Người | Deadline |
|---|---|---|
| Hoàn thiện evidence: mining chatlog chuẩn B (số + ≥5 quote nguyên văn) | A | 17:00 N1 |
| Khảo sát ≥20 người ngoài nhóm (chuẩn A) | A | 17:00 N1 |
| Viết spec §1-§3 đầy đủ (user, job, impact, giải pháp tương tự) | A | 17:00 N1 |
| Viết spec §4-§6 (thiết kế, automation, 4 lớp chỗ khó, ≥8 kịch bản) | D | 17:00 N1 |
| Viết spec §7 (chiều chất lượng + định nghĩa + quality bar) | B | 17:00 N1 |
| Viết spec §8-§9 (phân công, willing users, kế hoạch validation) | D | 17:00 N1 |
| **Commit spec.md trước 23:59** ← hạn cứng | D | 23:59 N1 |

**Quality bar cần chốt (ví dụ):**
```
Đạt khi ≥70% case qua bộ golden set, VÀ:
- 0 case nào AI bịa transcript không có căn cứ
- 100% case ngoài phạm vi được từ chối có giải thích
- Câu hỏi kiểm tra sinh ra phải thuộc đúng nội dung đã giải thích
```

---

### ✅ CP5 · Xác minh + Validation + Dry run — 09:00 Ngày 2
**Mục tiêu:** Feedback log ≥5 người, changelog, dry run hoàn chỉnh.

| Việc | Người | Deadline |
|---|---|---|
| Tổ chức user test: ≥5 người ngoài nhóm thử prototype | D | 08:30 N2 |
| Log feedback nguyên văn (tên, quote, mức nghiêm trọng) | D | 08:30 N2 |
| Ghi Changelog: thay đổi từ feedback (hoặc lý do giữ nguyên) | D | 08:30 N2 |
| Sửa prototype dựa trên 1–2 feedback quan trọng nhất | C + B | 08:30 N2 |
| Hoàn thiện slide demo (6 trang) | D | 08:30 N2 |
| Chạy lượt đo cuối cùng, cập nhật bảng eval/ | B | 08:30 N2 |
| Dry run đủ 5 phút, có bấm giờ | Cả nhóm | 09:00 N2 |

---

### ✅ CP6 · Demo — 10:00 Ngày 2
**Mục tiêu:** Demo 5' + Q&A 5' trước giám khảo.

| Script demo | Thời gian | Người trình bày |
|---|---|---|
| Slide 1: User & Job + con số pain | 45" | D |
| Slide 2: Vì sao chọn tính năng này (bảng impact) | 45" | A |
| Slide 3+Demo: Lát cắt + demo live (1 case chuẩn + 1 case chỗ khó) | 2' | C |
| Slide 4: Kết quả đo vs quality bar | 45" | B |
| Slide 5: User thật nói gì (quotes) | 45" | D |
| Slide 6: Nếu có thêm 1 tuần | 30" | A |

---

## 🏗️ Kiến trúc kỹ thuật (gợi ý)

```
┌─────────────────────────────────────────┐
│              Giao diện Chat              │
│  [Số lượt còn lại: 15] [Nhập câu hỏi]  │
│  ──────────────────────────────────────  │
│  AI: [Giải thích + Trích dẫn [B3·§12]] │
│  AI: ❓ Câu hỏi kiểm tra: ...           │
│  User: [Nhập câu trả lời]               │
│  AI: ✅ Đúng! +1 lượt hoàn lại.         │
└───────────────┬─────────────────────────┘
                │
        ┌───────▼────────┐
        │  Prompt Engine │  ← System prompt + context transcript
        │  (Gemini API)  │
        └───────┬────────┘
                │
    ┌───────────▼────────────┐
    │   Transcript Store     │  ← 6 file transcript + chatlog
    │   (RAG / search đơn)   │
    └────────────────────────┘
```

### Luồng logic lượt hỏi:
```
Bắt đầu ngày: quota = 15 lượt
Học viên hỏi → quota -= 1
AI giải thích → AI sinh câu hỏi kiểm tra
  └─ Học viên trả lời ĐÚNG → quota += 1 (hoàn lượt)
  └─ Học viên trả lời SAI  → không hoàn lượt
quota = 0 → thông báo hết lượt hôm nay, reset lúc 00:00
```

---

## 📁 Cấu trúc repo cần nộp

```
repo/
├── README.md               ← thành viên (mã HV + tên) + phân công có tên từng phần
├── spec.md                 ← AI Spec đầy đủ §1–§9
├── demo-slides.pdf         ← slide 6 trang
├── codebase/
│   ├── index.html / app/   ← prototype
│   ├── prompt.md           ← system prompt + prompt templates
│   └── api-trace.log       ← log lời gọi AI thật (không có API key)
├── eval/
│   ├── golden-set.csv      ← ≥20 case có input/output/expected/pass-fail
│   └── results-run1.md     ← bảng kết quả lượt 1
├── validation/
│   └── feedback-log.md     ← ≥5 mẩu feedback có tên người thử
└── reflection/
    ├── reflection-A.md
    ├── reflection-B.md
    ├── reflection-C.md
    └── reflection-D.md
```

---

## 🧩 Chi tiết 4 tính năng cần build

### Tính năng 1: Trả lời câu hỏi + Trích dẫn transcript
- Học viên hỏi bất kỳ câu hỏi về nội dung bài học
- AI search trong transcript để tìm đoạn liên quan
- Trả lời kèm trích dẫn: `[Buổi 3 · đoạn §12]`
- **Chỗ khó ①**: Không có trong transcript → AI từ chối, không bịa

### Tính năng 2: Hỏi về trao đổi giảng viên–học viên hôm đó
- Học viên hỏi: *"Hôm nay thầy nói gì về X?"* / *"Bạn nào hỏi về Y không?"*
- AI search trong chatlog của buổi hôm đó (theo ngày/session)
- Trả lời có context: ai hỏi, thầy trả lời gì, đoạn nào trong transcript
- **Chỗ khó ②**: Buổi hôm đó chưa có transcript → thông báo rõ

### Tính năng 3: Câu hỏi kiểm tra sau giải thích
- Sau MỖI lần AI giải thích → tự sinh 1 câu hỏi kiểm tra hiểu
- Câu hỏi phải thuộc đúng nội dung vừa giải thích
- Học viên nhập câu trả lời → AI đánh giá đúng/sai/gần đúng
- **Chỗ khó ④**: Câu hỏi không được đánh giá sai câu trả lời đúng (domain risk)

### Tính năng 4: Hệ thống lượt hỏi gamification
- Giới hạn: **15 lượt/ngày** (reset lúc 00:00)
- Hoàn lượt: trả lời đúng câu hỏi kiểm tra → +1 lượt
- Hiển thị: `🔵 Lượt còn lại: 12/15` (cập nhật real-time)
- **Chỗ khó ③**: Học viên cố tình vượt giới hạn → từ chối có giải thích

---

## 📏 Nguyên tắc HAX/PAIR áp dụng (≥4)

| Nguyên tắc | Áp vào đâu trong prototype |
|---|---|
| **G1** — Làm rõ hệ thống làm được gì | Tin nhắn chào đầu tiên: "Tôi có thể giải thích nội dung từ 6 buổi học dựa trên transcript. Hỏi tôi về khái niệm, trao đổi lớp hôm nay, hoặc để tôi kiểm tra bạn nhé!" |
| **G2** — Làm rõ độ tin cậy | Mọi câu trả lời hiển thị trích dẫn nguồn `[B3·§12]`; nếu không có căn cứ thì nói rõ |
| **G10** — Thu hẹp phạm vi khi nghi ngờ | Câu hỏi mơ hồ → AI hỏi lại 1 câu ("Bạn đang hỏi về buổi học nào?") thay vì đoán |
| **G11** — Giải thích vì sao | Đánh giá câu trả lời kiểm tra: giải thích đúng/sai theo đúng điểm trong transcript |
| **G15** — Mời feedback | Sau mỗi câu trả lời: 👍 / 👎 + "Câu trả lời này có hữu ích không?" |

---

## ⚠️ 4 Lớp chỗ khó cần xử lý

| Lớp | Tình huống cụ thể | Hành vi mong muốn |
|---|---|---|
| ① Nguồn sự thật | Học viên hỏi điều không có trong transcript | "Tôi không tìm thấy thông tin này trong transcript 6 buổi học. Bạn có thể hỏi giảng viên trực tiếp." |
| ② Mơ hồ | Hỏi "Hôm nay lớp nói gì?" (quá rộng) | Hỏi lại: "Bạn muốn hỏi về chủ đề cụ thể nào trong buổi hôm nay?" |
| ③ Ngoài phạm vi | Hỏi giải bài tập chấm điểm / deadline / admin | "Câu này nằm ngoài phạm vi tutor học thuật. Hỏi TA trực tiếp để được hỗ trợ đúng chỗ." |
| ④ Đặc thù domain | AI đánh giá sai câu trả lời đúng của học viên | Luôn hiển thị đoạn transcript căn cứ kèm đánh giá; học viên có thể phản bác và AI giải thích lại |

---

## 🔗 Tài liệu tham khảo

| File | Dùng khi nào |
|---|---|
| [`01-de-bai.md`](./01-de-bai.md) | Kiểm tra 5 tiêu chí nghiệm thu |
| [`02-guide.md`](./02-guide.md) | Hướng dẫn từng giai đoạn chi tiết |
| [`03-template-ai-spec.md`](./03-template-ai-spec.md) | Template viết spec.md |
| [`04-rubric.md`](./04-rubric.md) | Rubric 100 điểm — đọc trước khi viết bất kỳ thứ gì |
| [`data/vlearn-pack/chatlog/`](./data/vlearn-pack/chatlog/) | Chatlog mining bằng chứng |
| [`data/vlearn-pack/transcript/`](./data/vlearn-pack/transcript/) | 6 transcript bài giảng |
