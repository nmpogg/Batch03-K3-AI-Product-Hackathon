# AI SPEC — VLearn Smart Tutor (AI Tutor có kiểm tra hiểu bài) · Nhóm [B1-D305]
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job
- **Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):** Học viên đang ôn bài sau buổi học trên VLearn
- **Core JTBD (không tên sản phẩm/AI trong câu):** Học viên muốn ôn lại khái niệm chưa rõ trong buổi học để đảm bảo mình hiểu đúng kiến thức.
- **Problem statement (KHÔNG chữ AI):** Khi học viên thắc mắc và được giải thích, họ không có cách nào tự kiểm chứng xem mình đã hiểu đúng và đủ sâu hay chưa, dẫn đến rủi ro tự tin sai hoặc bỏ qua lỗ hổng kiến thức.
- **Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):** Mining chuẩn B (Nguồn: `chat_history_anonymized_for_hackathon.csv` — 2.522 dòng, 1.261 turns, 585 hội thoại, 369 user)
  - **Số liệu mining / kết quả khảo sát (n = ?, % xác nhận):** 
    - Tutor KHÔNG hỏi lại học viên sau giải thích (`asked_check_question=False`): 1.258 / 1.261 (99.76%)
    - Tutor trả lời không có grounding (citations rỗng): 582 / 1.261 (46.2%)
    - Hội thoại chỉ 1 turn rồi bỏ (single-turn dropout): 309 / 585 (52.8%)
  - **≥5 quote/ví dụ nguyên văn + nguồn:**
    1. *C0001 (student hỏi về slide, tutor thất bại):* "Xin lỗi bạn, tôi không tìm thấy nội dung cụ thể cho slide 37 trong tài liệu hiện có." → Single-turn dropout.
    2. *C0002 (student muốn tóm tắt):* "Chào bạn, hiện tại tôi không tìm thấy tài liệu tổng hợp đầy đủ cho toàn bộ nội dung của Ngày 04 trong slide được cung cấp." → Từ chối không follow-up.
    3. *C0021 (down-rated, không tìm được trang):* "Rất xin lỗi vì hiện tại hệ thống tìm kiếm không tìm thấy nội dung cụ thể cho trang 4..." → Học viên down-rate vì đẩy gánh nặng ngược lại.
    4. *C0031 (down-rated, trả lời không căn cứ):* "Rất tiếc, tôi không thể tìm thấy tệp tin hoặc nội dung chi tiết của `day05-lecture-slides-batch03.pdf`..."
    5. *C0015 (hỏi về ReAct, không tìm được):* "Rất tiếc, tôi không tìm thấy định nghĩa chi tiết về 'ReAct' trong các slide bài giảng hiện tại..." → Không kết nối được transcript.
    6. *C0004 (input mơ hồ):* "Rất xin lỗi, mình không tìm thấy thuật ngữ 'điêu toa' trong tài liệu..." → Từ chối thay vì hỏi lại.

## §2. Impact & quyết định chọn
- **Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):**
  - **P1 (Ứng viên CHỌN):** Tutor giải thích xong không kiểm tra hiểu bài → học viên không biết mình hiểu đúng không (99.76% turns không có check question). Hậu quả: Học viên tự tin sai, kiến thức không được củng cố.
  - **P2 (Ứng viên ĐÃ LOẠI):** Tutor không grounding vào transcript → trả lời bịa hoặc từ chối (46.2% citations rỗng). 
  - **P3 (Ứng viên ĐÃ LOẠI):** Hội thoại kết thúc sau 1 turn → không có follow-up học tập (52.8% single-turn).
- **Ứng viên ĐÃ LOẠI + vì sao:** 
  - Loại P2 vì đây là infrastructure problem (vấn đề hạ tầng) cần fix ở backend (RAG/Search), không phải UX feature phù hợp cho 1 lát cắt tính năng AI mới của Hackathon.
  - Loại P3 vì P3 là hệ quả của P1 và P2. Giải quyết P1 tốt sẽ tự động giải quyết P3 (giúp hội thoại kéo dài hơn).
- **Ứng viên CHỌN + vì sao (bằng số):** Chọn P1. Lý do: Đây là pain có thể giải bằng 1 tính năng UX cụ thể (auto check question), bằng chứng dữ liệu cực mạnh (99.76% cơ hội bị bỏ lỡ), và giải P1 đồng thời giảm P3 vì học viên có lý do tương tác tiếp.

## §3. Giải pháp tương tự đã nghiên cứu
- **[Khanmigo]**: Flow tự đặt câu hỏi gợi mở rất hay / Đáng học: Cách AI đóng vai trò người hướng dẫn thay vì cỗ máy trả lời / Đáng né: Chat flow quá dài dòng, tốn thời gian / Mình khác gì: AI của mình chuyên biệt cho transcript VLearn, trích dẫn nguồn rõ ràng và có cơ chế hoàn lượt hỏi làm động lực.
- **[Coursera Coach]**: Flow giải thích bài giảng tốt / Đáng học: Grounding chặt chẽ vào video transcript / Đáng né: Giải thích xong là ngắt, không kiểm tra lại độ hiểu của người học / Mình khác gì: Tính năng cốt lõi là sinh câu hỏi kiểm tra độ hiểu bài ngay sau khi giải thích.

## §4. Thiết kế
- **Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):** Học viên đang ôn bài tối sau buổi học → hỏi AI tutor về khái niệm chưa rõ trên VLearn → AI giải thích có trích dẫn transcript [Buổi N · đoạn M] và tự động đặt 1 câu hỏi kiểm tra → học viên trả lời → AI đánh giá + giải thích thêm nếu sai → học viên hiểu đúng kiến thức và nhận lại 1 lượt hỏi.
- **Non-goals (≥3 thứ KHÔNG build):** 
  1. Không build hệ thống tự động giải bài tập chấm điểm (chỉ tập trung ôn tập khái niệm).
  2. Không build phân tích video/hình ảnh (chỉ xử lý text transcript).
  3. Không build hệ thống theo dõi tiến độ học dài hạn qua nhiều môn (chỉ giới hạn trong 1 session môn học).
- **Mức prototype nhắm tới:** [ ] Sketch [x] Mock [ ] Working — **phần nào mock, phần nào thật:** UI giao diện chat trên frontend, data transcript của BTC cấp. Lời gọi AI (sinh câu trả lời, sinh câu hỏi kiểm tra và chấm điểm) là chạy AI thật qua API.
- **Automation:** [ ] augment [x] conditional [ ] automate — **lý do theo cost-of-error:** AI tự giải thích + sinh câu hỏi khi có căn cứ transcript; từ chối rõ khi ngoài phạm vi. Lý do: sai kiến thức AI truyền cho học viên = học viên tiếp thu sai → cost-of-error cao, cần có grounding chặt chẽ, nếu không chắc thì không sinh câu hỏi.
- **§4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):**
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **G1** — Làm rõ hệ thống làm được gì | Tin nhắn chào đầu tiên: "Tôi có thể giải thích nội dung trong buổi học dựa trên transcript. Hỏi tôi về khái niệm, trao đổi lớp hôm nay, hoặc để tôi kiểm tra bạn nhé!" |
  | **G2** — Làm rõ độ tin cậy | Mọi câu trả lời hiển thị trích dẫn nguồn `[B3·§12]`; nếu không có căn cứ thì nói rõ |
  | **G10** — Thu hẹp phạm vi khi nghi ngờ | Câu hỏi mơ hồ → AI hỏi lại 1 câu ("Bạn đang hỏi về buổi học nào?") thay vì đoán |
  | **G11** — Giải thích vì sao | Đánh giá câu trả lời kiểm tra: giải thích đúng/sai theo đúng điểm trong transcript |
  | **G15** — Mời feedback | Sau mỗi câu trả lời: 👍 / 👎 + "Câu trả lời này có hữu ích không?" |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

| Lớp | Tình huống cụ thể | Hành vi mong muốn | Nguyên tắc áp dụng |
|---|---|---|---|
| ① Nguồn sự thật | Học viên hỏi điều không có trong transcript | "Tôi không tìm thấy thông tin này trong transcript 6 buổi học. Bạn có thể hỏi giảng viên trực tiếp." | G2 |
| ① Nguồn sự thật | AI tự bịa (hallucinate) khái niệm ngoài bài giảng | AI bị giới hạn nghiêm ngặt trong system prompt. Nếu không có trong nguồn, bắt buộc báo lỗi và tuyệt đối không tự sinh câu trả lời. | G2 |
| ② Mơ hồ | Hỏi "Hôm nay lớp nói gì?" (quá rộng) | Hỏi lại: "Bạn muốn hỏi về chủ đề cụ thể nào trong buổi hôm nay?" | G10 |
| ② Mơ hồ | Học viên trả lời test mập mờ ("có", "không rõ") | AI không vội chấm sai, yêu cầu học viên: "Bạn có thể giải thích chi tiết hơn ý này được không?" | G10 |
| ③ Ngoài phạm vi | Hỏi giải bài tập chấm điểm / deadline / admin | "Câu này nằm ngoài phạm vi tutor học thuật. Hỏi TA trực tiếp để được hỗ trợ đúng chỗ." | G1 |
| ③ Ngoài phạm vi | Học viên nhờ AI viết code dự án cuối khóa | "Mình là AI Tutor giúp ôn tập, không thể viết code hộ bạn. Mình có thể gợi ý hướng giải quyết nhé." | G1 |
| ④ Đặc thù domain | AI đánh giá sai câu trả lời đúng của học viên | Luôn hiển thị đoạn transcript căn cứ kèm đánh giá; học viên có thể phản bác và AI giải thích lại | G11, G15 |
| ④ Đặc thù domain | Học viên hiểu đúng nhưng dùng sai thuật ngữ | Đánh giá đúng 1 phần, khen ngợi ý tưởng đúng và nhẹ nhàng đính chính lại thuật ngữ chuẩn. | G11 |

## §6. Bốn đường đi của trải nghiệm
- **Happy path:** Học viên hỏi khái niệm → AI giải thích có trích dẫn + sinh câu hỏi kiểm tra → Học viên trả lời đúng → AI khen ngợi, củng cố kiến thức và hoàn lại 1 lượt hỏi.
- **Low-confidence (②):** Học viên hỏi một từ khóa quá ngắn (VD: "React") → AI không chắc ý học viên (định nghĩa hay cách lỗi) → AI hỏi ngược lại để làm rõ ("Bạn muốn hỏi định nghĩa hay cách dùng React?") trước khi sinh câu trả lời.
- **Failure/không căn cứ (①):** Học viên hỏi khái niệm ngoài bài giảng → AI phản hồi "Không tìm thấy trong transcript bài học", khuyên học viên hỏi TA.
- **Correction (user sửa):** AI chấm sai câu trả lời đúng do học viên dùng từ đồng nghĩa → Học viên bấm 👎 "Tài liệu bảo thế này cơ mà" → AI xin lỗi, check lại context và sửa lại thành đúng.
- **Khi bị đòi ngoài phạm vi (③):** Học viên bảo "Làm hộ bài tập số 5" → AI từ chối khéo: "Mình chỉ có thể hướng dẫn tư duy, bạn có muốn mình gợi ý bước đầu tiên không?"
- **Case đặc thù domain (④):** Học viên trả lời gần đúng nhưng thiếu ý quan trọng → AI chấm "Đúng một phần", giải thích phần còn thiếu và khuyến khích đọc lại trang có liên quan.

## §7. Kiểm thử
- **Chiều chất lượng + định nghĩa kiểm chứng được:** 
  1. An toàn & Grounding: Pass/Fail - 100% câu trả lời phải trace được về transcript.
  2. Đánh giá đúng/sai: Pass/Fail - AI chấm câu trả lời của user chính xác so với ý trong transcript.
  3. Tính sư phạm: Thang 1-5 - Câu hỏi kiểm tra sinh ra không quá dễ, không quá đánh đố, và bám sát kiến thức vừa giải thích.
- **Golden set:** Đã tạo (file `golden-set.csv` trong thư mục `eval/`).
- **Quality bar (chốt từ 23:59, giữ nguyên sau đó):** "Đạt khi ≥ 85% qua bộ test, và 100% không có lỗi bịa đặt thông tin (hallucination) ngoài transcript."
- **Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):** Đang đo (cập nhật từ `eval/results-run1.md` v.v.)

## §8. Phân công & kế hoạch
- **Phân công có tên:** 
  - Nguyễn Văn Đại: Evidence (mining + khảo sát) · spec §1-§3 · bảng impact
  - Ngô Minh Phong: Prompt engineering · golden set eval/ · đo chất lượng
  - Nguyễn Thùy Trang: Frontend chat + flow lượt hỏi · integration API · commit đầu
  - Trần Hoàng Vũ: Spec §4-§9 · tổ chức CP5 validation · slide demo 6 trang
- **Willing users (≥3 tên) + kế hoạch vòng validation CP5 (3 câu hỏi, ai log):** 
  - Willing users: Học viên VLearn cùng phòng lab.
  - Kế hoạch: Test demo vào sáng N2. Trần Hoàng Vũ chịu trách nhiệm log.
  - 3 câu hỏi validation: (1) Bạn có thấy câu hỏi kiểm tra này giúp bạn nhớ bài tốt hơn không? (2) Khi AI báo bạn trả lời sai, giải thích có thuyết phục không? (3) Bạn có cảm thấy bị phiền khi AI tự động hỏi lại không?
- **Multi-prototype (nếu làm):** Trục khác biệt: Mức độ chủ động của AI (Chủ động vs Chờ gọi).
  - *Phương án A:* AI tự động sinh câu hỏi kiểm tra ngay dưới câu trả lời.
  - *Phương án B:* AI hiện nút "Kiểm tra tôi xem", user bấm vào mới hiện câu hỏi.
  - *Lý do chọn A:* Sau khi test thử nhanh, user lười bấm nút. Phương án tự động sẽ thúc ép tương tác và tạo thói quen học tập sâu hiệu quả hơn.

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 17:30 N1 | Tạo Spec CP4 | Tổng hợp từ CP1-Canvas và Team Plan |
