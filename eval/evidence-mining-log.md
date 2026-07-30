# Mining Evidence Log — VLearn Smart Tutor

> **Chuẩn B** — Số mining đếm được + ≥5 ví dụ nguyên văn + phương pháp đếm kiểm lại được

## Nguồn data

- File: `data/vlearn-pack/chatlog/chat_history_anonymized_for_hackathon.csv`
- Phạm vi: 2.522 dòng · 1.261 turns · 585 hội thoại · 369 user
- Thời gian: 22/07/2026 → 29/07/2026
- Scripts mining: `evidence-mine.py`, `evidence-mine2.py` (chạy lại được)

## Phương pháp đếm

Đọc toàn bộ file CSV bằng Python `csv.DictReader`, đếm theo từng field:
- `asked_check_question`: đếm giá trị `True` trong cột tutor rows
- `citations`: đếm dòng có giá trị `[]` hoặc rỗng trong tutor rows
- `follow_ups`, `misconceptions`: đếm dòng khác `[]` trong tutor rows
- `rating`: đếm giá trị `up`/`down` trong tất cả rows
- Single-turn: đếm conversation_id chỉ có đúng 2 dòng (1 student + 1 tutor)

Người khác kiểm lại bằng cách: clone repo → `python evidence-mine.py` → so sánh output.

## Kết quả đếm chính

| Chỉ số mining | Số đếm | % | Ý nghĩa |
|---|---|---|---|
| `asked_check_question = True` | **3 / 1.261** | **0.24%** | Tutor hầu như KHÔNG BAO GIỜ hỏi lại học viên đã hiểu chưa |
| `asked_check_question = False` | **1.258 / 1.261** | **99.76%** | Sau 1258 lần giải thích, học viên tự đánh giá hiểu hay không |
| Citations rỗng (tutor không grounding) | **582 / 1.261** | **46.2%** | Gần nửa số câu trả lời không có nguồn transcript |
| Tutor thất bại rõ ("không tìm thấy") | **299 / 582** | **51.4% trong no-cite** | Tutor nói "xin lỗi, không tìm thấy" thay vì giải thích |
| Single-turn conversations | **309 / 585** | **52.8%** | Học viên hỏi 1 lần rồi bỏ, không tiếp tục học |
| `validate_understanding` move | **1 / 1.261** | **0.08%** | Move kiểm tra hiểu bài gần như không dùng |
| `follow_ups` field được dùng | **0 / 1.261** | **0%** | Field gợi ý câu hỏi tiếp theo CHƯA TỪNG được dùng |
| `misconceptions` field được dùng | **0 / 1.261** | **0%** | Field phát hiện hiểu lầm CHƯA TỪNG được dùng |
| Down-rated không có citation | **29** | — | vs 8 down-rated có citation — grounding giảm 3.6× risk bị đánh giá xấu |
| Rating coverage | **70 / 2.522** | **2.8%** | Rất ít học viên rating → pain ngầm khó đo bằng feedback thông thường |

## ≥5 ví dụ nguyên văn

### Ví dụ 1 — [C0001] Single-turn, tutor thất bại tìm slide
- **Student:** `(Trang 37, đoạn được chọn: "tóm tắt nội dung chính trong slide này") tóm tắt nội dung chính trong slide này`
- **Tutor (citations=[]):** `Xin lỗi bạn, tôi không tìm thấy nội dung cụ thể cho slide 37 trong tài liệu hiện có. Bạn có thể cung cấp thêm thông tin hoặc tiêu đề của slide đó để tôi có thể hỗ trợ bạn chính xác hơn không?`
- **Lớp pain:** ① Nguồn sự thật — tutor không tìm được, không dẫn đến nội dung có sẵn, đẩy gánh nặng về phía học viên
- **asked_check_question:** False

### Ví dụ 2 — [C0021] DOWN-RATED, không tìm được trang cụ thể
- **Tutor (citations=[], DOWN ↓):** `Chào bạn, rất xin lỗi vì hiện tại hệ thống tìm kiếm không tìm thấy nội dung cụ thể cho trang 4 trong tài liệu của bài học hôm nay. Bạn có thể vui lòng cung cấp nội dung hoặc tiêu đề của trang 4 đó để mình hỗ trợ giải thích rõ hơn cho bạn không?`
- **Lớp pain:** ① Nguồn sự thật — tutor không grounding, đẩy gánh nặng về học viên → học viên bấm 👎

### Ví dụ 3 — [C0031] DOWN-RATED, không tìm được slide PDF
- **Student:** hỏi tóm tắt `day05-lecture-slides-batch03.pdf`
- **Tutor (citations=[], DOWN ↓):** `Rất tiếc, tôi không thể tìm thấy tệp tin hoặc nội dung chi tiết của day05-lecture-slides-batch03.pdf trong hệ thống hiện tại để tóm tắt các chủ đề chính cho bạn.`
- **Lớp pain:** ① Nguồn sự thật — tutor nói "không tìm thấy" ngay cả khi tài liệu có trong pack

### Ví dụ 4 — [C0015] Tutor không kết nối được kiến thức có trong transcript
- **Student:** `(Trang 2) Designt Pattern ReAct là gì có lưu ý gì về nó?`
- **Tutor (citations=[]):** `Rất tiếc, tôi không tìm thấy định nghĩa chi tiết về "ReAct" trong các slide bài giảng hiện tại của ngày học này.`
- **Lớp pain:** ① Nguồn sự thật — ReAct có trong transcript T04 nhưng tutor không tìm được cross-session

### Ví dụ 5 — [C0004] Input mơ hồ, tutor từ chối thay vì hỏi lại
- **Student:** `(Trang 25, đoạn được chọn: "điêu toa") điêu toa`
- **Tutor (citations=[]):** `Rất xin lỗi, mình không tìm thấy thuật ngữ "điêu toa" trong tài liệu của bài học hôm nay. Có thể đây không phải là một thuật ngữ chuyên môn hoặc nằm ngoài phạm vi của nội dung slide được cung cấp.`
- **Lớp pain:** ② Mơ hồ — input không rõ ý → tutor nên hỏi lại thay vì từ chối

### Ví dụ 6 — [C0076] DOWN-RATED, tìm nhầm số trang
- **Tutor (citations=[], DOWN ↓):** `Rất tiếc là tôi đã tra cứu trong tài liệu nhưng chưa tìm thấy nội dung cụ thể của Trang 33. Kết quả tìm kiếm chỉ hiển thị các trang khác có nhắc đến con số "33" (như mức điểm 33% trong các bài kiểm tra đánh giá AI trên trang 60 và 72).`
- **Lớp pain:** ① Nguồn sự thật — tutor hiểu nhầm "trang 33" là số 33 trong content

## Kết luận bằng chứng

Pain được chọn: **Tutor không kiểm tra học viên đã hiểu đúng chưa sau giải thích**

- Bằng chứng trực tiếp: `asked_check_question = True` chỉ **3/1.261 (0.24%)** — con số kiểm lại được
- Bằng chứng gián tiếp: `validate_understanding` move chỉ dùng 1 lần · `follow_ups` field chưa từng dùng
- Hậu quả đo được: `52.8%` single-turn dropout — học viên hỏi xong không quay lại tiếp tục học
- Down-rating gắn với no-citation: 29 vs 8 — grounding là yếu tố chính của chất lượng
