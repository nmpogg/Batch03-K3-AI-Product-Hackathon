# CP1 CANVAS — VLearn Smart Tutor
> Nhóm: [XX] · Zone: [X] · Ngày 1 · 10:00

---

## Canvas 7 dòng (format §1.5)

| # | Mục | Nội dung |
|---|---|---|
| 1 | **Hướng** | A — VLearn · Tính năng mới: AI Tutor có kiểm tra hiểu bài |
| 2 | **Job executor** | Học viên đang ôn bài sau buổi học trên VLearn |
| 3 | **Pain 1 câu** | Học viên hỏi AI tutor, được giải thích xong nhưng không biết mình thực sự hiểu đúng không — tutor không bao giờ hỏi lại → học viên tự tin sai hoặc bỏ qua mà không củng cố |
| 4 | **Bằng chứng đầu** | Mining 1.261 turns chatlog thật: `asked_check_question = True` chỉ **3/1.261 lần (0.24%)** — 1.258 lần giải thích xong, tutor KHÔNG kiểm tra học viên đã hiểu chưa |
| 5 | **Lát cắt MỘT CÂU** | Học viên đang ôn bài sau buổi học → hỏi AI tutor về khái niệm chưa rõ → AI giải thích có trích dẫn transcript + tự động đặt 1 câu hỏi kiểm tra → học viên trả lời đúng → hiểu sâu hơn + nhận lại 1 lượt hỏi |
| 6 | **Automation + lý do** | **Conditional** — AI tự giải thích + sinh câu hỏi khi có căn cứ transcript; từ chối rõ khi ngoài phạm vi. Lý do: sai kiến thức AI truyền cho học viên = học sai → cost-of-error cao, cần có grounding |
| 7 | **Willing users + phân công** | Willing users: [tên 1], [tên 2], [tên 3] · Phân công: A=evidence/spec, B=prompt/eval, C=frontend/flow, D=spec§4-9/validation |

---

## Bằng chứng đầu (Mining chuẩn B)

**Nguồn:** `chat_history_anonymized_for_hackathon.csv` — 2.522 dòng, 1.261 turns, 585 hội thoại, 369 user, 22/07–29/07/2026.

### Số liệu đếm được

| Chỉ số | Số | % |
|---|---|---|
| Tutor KHÔNG hỏi lại học viên sau giải thích (`asked_check_question=False`) | **1.258 / 1.261** | **99.76%** |
| Tutor trả lời không có grounding (citations rỗng) | **582 / 1.261** | **46.2%** |
| Trong số không có citation: tutor thất bại rõ ràng ("không tìm thấy") | **299 / 582** | **51.4%** |
| Hội thoại chỉ 1 turn rồi bỏ (single-turn dropout) | **309 / 585** | **52.8%** |
| Tutor dùng `validate_understanding` move | **1 / 1.261** | **0.08%** |
| Tutor dùng `follow_ups` field | **0 / 1.261** | **0%** |
| Tutor dùng `misconceptions` field | **0 / 1.261** | **0%** |
| Down-rated: không có citation | **29** | vs 8 có citation |

**Phương pháp đếm:** đọc toàn bộ 2.522 dòng CSV bằng script Python, đếm theo field `asked_check_question`, `citations`, `follow_ups`, `misconceptions`, `rating`. Kết quả kiểm lại được bằng cách chạy lại script `mine.py` + `mine2.py` trong repo.

### ≥5 ví dụ nguyên văn từ chatlog

**Ví dụ 1 — C0001 · student hỏi về slide, tutor thất bại không grounding:**
> **Student:** "(Trang 37, đoạn được chọn: 'tóm tắt nội dung chính trong slide này') tóm tắt nội dung chính trong slide này"
> **Tutor:** "Xin lỗi bạn, tôi không tìm thấy nội dung cụ thể cho slide 37 trong tài liệu hiện có. Bạn có thể cung cấp thêm thông tin hoặc tiêu đề của slide đó để tôi có thể hỗ trợ bạn chính xác hơn không?"
> → *Học viên hỏi xong, tutor trả lời trống, hội thoại kết thúc (single-turn)*

**Ví dụ 2 — C0002 · student muốn tóm tắt buổi học, tutor từ chối rồi không follow-up:**
> **Student:** "(Trang 50) tóm gọn những nội dung quan trọng nhất trong day 04 này"
> **Tutor:** "Chào bạn, hiện tại tôi không tìm thấy tài liệu tổng hợp đầy đủ cho toàn bộ nội dung của Ngày 04 trong slide được cung cấp."
> → *Tutor từ chối nhưng không hỏi lại, không dẫn học viên đến nội dung có sẵn*

**Ví dụ 3 — C0021 (down-rated) · tutor không tìm được trang cụ thể:**
> **Tutor (DOWN-RATED):** "Chào bạn, rất xin lỗi vì hiện tại hệ thống tìm kiếm không tìm thấy nội dung cụ thể cho trang 4 trong tài liệu của bài học hôm nay. Bạn có thể vui lòng cung cấp nội dung hoặc tiêu đề của trang 4 đó để mình hỗ trợ giải thích rõ hơn cho bạn không?"
> → *Học viên bấm 👎 — tutor đẩy gánh nặng ngược lại cho học viên*

**Ví dụ 4 — C0031 (down-rated) · student hỏi tóm tắt slide, tutor trả lời không có căn cứ:**
> **Tutor (DOWN-RATED):** "Rất tiếc, tôi không thể tìm thấy tệp tin hoặc nội dung chi tiết của `day05-lecture-slides-batch03.pdf` trong hệ thống hiện tại để tóm tắt các chủ đề chính cho bạn."
> → *Citation: [] — tutor trả lời hoàn toàn không grounding*

**Ví dụ 5 — C0015 · student hỏi về ReAct Design Pattern, tutor không tìm được:**
> **Student:** "(Trang 2) Designt Pattern ReAct là gì có lưu ý gì về nó?"
> **Tutor:** "Rất tiếc, tôi không tìm thấy định nghĩa chi tiết về 'ReAct' trong các slide bài giảng hiện tại của ngày học này."
> → *Chủ đề ReAct có trong transcript T04 — tutor không kết nối được*

**Ví dụ 6 — C0004 · student bôi đoạn mơ hồ "điêu toa":**
> **Student:** "(Trang 25, đoạn được chọn: 'điêu toa') điêu toa"
> **Tutor:** "Rất xin lỗi, mình không tìm thấy thuật ngữ 'điêu toa' trong tài liệu của bài học hôm nay."
> → *Input mơ hồ → tutor từ chối thay vì hỏi lại để hiểu ý học viên*

---

## 3 Pain ứng viên từ data

| # | Pain | Bằng chứng số | Hậu quả |
|---|---|---|---|
| **P1** ← CHỌN | Tutor giải thích xong không kiểm tra hiểu bài → học viên không biết mình hiểu đúng không | 99.76% turns không có check question | Học viên tự tin sai, kiến thức không được củng cố |
| P2 | Tutor không grounding vào transcript → trả lời bịa hoặc từ chối không hữu ích | 46.2% citations rỗng · 51.4% thất bại rõ | Down-rated, học viên mất tin tưởng |
| P3 | Hội thoại kết thúc sau 1 turn → không có follow-up học tập | 52.8% single-turn conversations | Học viên hỏi xong bỏ, không học sâu được |

> **Lý do chọn P1:** Đây là pain **có thể giải bằng 1 tính năng cụ thể** (auto check question) · bằng chứng cực mạnh (99.76%) · giải P1 đồng thời giảm P3 (học viên có lý do ở lại). P2 là infrastructure problem cần fix ở backend, không phải UX feature.

---

## Lát cắt chính thức

> **Học viên đang ôn bài tối sau buổi học** → hỏi AI tutor về khái niệm chưa rõ trên VLearn → AI giải thích có trích dẫn transcript [Buổi N · đoạn M] và tự động đặt 1 câu hỏi kiểm tra → học viên trả lời → AI đánh giá + giải thích thêm nếu sai → học viên nhận lại 1 lượt hỏi nếu đúng.

**Kiểm tra format:** 1 user ✅ · 1 việc (ôn bài) ✅ · 1 quyết định AI (sinh câu hỏi kiểm tra sau giải thích) ✅ · 1 kết quả (biết mình hiểu đúng không + hoàn lượt) ✅

---

## Phân công chốt tại CP1

| Người | Tên | Phần chịu trách nhiệm |
|---|---|---|
| A | Nguyễn Văn Đại | Evidence (mining + khảo sát ≥20 người) · spec §1-§3 · bảng impact |
| B | Ngô Minh Phong | Prompt engineering · golden set eval/ · đo chất lượng |
| C | Nguyễn Thùy Trang | Frontend chat + flow lượt hỏi · integration API · commit đầu |
| D | Trần Hoàng Vũ | Spec §4-§9 · tổ chức CP5 validation · slide demo 6 trang |
