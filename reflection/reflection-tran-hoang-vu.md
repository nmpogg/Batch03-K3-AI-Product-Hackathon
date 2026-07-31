# BÀI HỌC VÀ SUY NGẪM CÁ NHÂN (REFLECTION)

**Họ và tên:** Trần Hoàng Vũ  
**Mã học viên:** 2A202602000  
**Vai trò trong nhóm:** Person D — Lead Thiết kế AI Spec (§4–§9), Validation CP5 & Slide Demo  
**Dự án:** VLearn Smart Tutor — AI Spec Hackathon Batch 03 (Hướng A — VLearn)  

---

## 1. Vai trò & Các phần việc cá nhân tôi đã trực tiếp đảm nhận

Trong dự án **VLearn Smart Tutor**, tôi đảm nhận vai trò **Person D**, chịu trách nhiệm chính về kiến trúc trải nghiệm AI (AI Experience Architecture), thiết kế kỹ lưỡng bản Spec kỹ thuật từ §4 đến §9, thực thi vòng kiểm chứng thực tế CP5 và biên soạn Slide Demo cho vòng chung kết.

Cụ thể, các sản phẩm cá nhân tôi đã tạo lập và chịu trách nhiệm giải thích bao gồm:

### a. Thiết kế Hệ thống & Nguyên tắc HAX/PAIR (`spec.md §4`)
- **Định hình Lát cắt 1 câu:** Tôi chốt lát cắt trải nghiệm cốt lõi: *"Học viên đang ôn bài sau buổi học → hỏi AI tutor về khái niệm chưa rõ → AI giải thích có trích dẫn transcript `[Buổi N · §M]` và tự động đặt 1 câu hỏi kiểm tra → học viên trả lời → AI đánh giá/giải thích thêm và hoàn 1 lượt hỏi."*
- **Xác định ranh giới (Non-goals):** Loại bỏ 3 tính năng gây phân tán nguồn lực trong hackathon (không làm chấm điểm bài tập tự luận dài, không xử lý OCR/hình ảnh, không theo dõi tiến độ đa môn học).
- **Mô hình Automation:** Quyết định chọn **Conditional Automation (Tự động có điều kiện)** thay vì Full Automation. Lý do chuyên môn: Trong giáo dục, chi phí sai sót (Cost-of-Error) rất cao — nếu AI tự động đưa ra kiến thức sai mà học viên tiếp thu thì hậu quả rất nghiêm trọng. Do đó, AI chỉ tự động sinh giải thích + câu hỏi khi có trích dẫn nguồn chắc chắn; nếu độ tin cậy thấp hoặc ngoài scope thì phải dừng lại báo lỗi/hỏi lại.
- **Áp dụng 5 nguyên tắc HAX/PAIR:**
  - `G1` (Làm rõ khả năng): Tin nhắn chào hiển thị rõ giới hạn và khả năng hỗ trợ ôn tập.
  - `G2` (Làm rõ độ tin cậy): Bắt buộc mọi câu trả lời hiển thị citation `[Buổi N · §M]`.
  - `G10` (Thu hẹp phạm vi khi nghi ngờ): Khi học viên gõ từ khóa quá ngắn hoặc mơ hồ, AI không đoán mò mà đặt 1 câu hỏi làm rõ.
  - `G11` (Giải thích vì sao): Khi chấm câu trả lời của học viên, AI bắt buộc nêu lý do đúng/sai dựa theo bài giảng.
  - `G15` (Khuyến khích phản hồi): Đính kèm nút 👍/👎 để thu thập feedback cải tiến.

### b. Quản trị Rủi ro & Kịch bản Trải nghiệm (`spec.md §5 & §6`)
- **Xây dựng Ma trận 4 Lớp Chỗ Khó (§5):** Phân tích 8 kịch bản rủi ro chia thành 4 lớp: *(1) Nguồn sự thật* (hallucination, thông tin ngoài transcript); *(2) Mơ hồ* (input quá rộng/trả lời mập mờ); *(3) Ngoài phạm vi* (nhờ giải bài tập, hỏi deadline/điểm số); *(4) Đặc thù domain* (hiểu đúng ý nhưng dùng sai thuật ngữ).
- **Thiết kế 4 Đường đi Trải nghiệm (§6):** Vạch ra luồng xử lý chi tiết cho Happy Path, Low-confidence Path (khi intent mơ hồ), Failure Path (khi không có grounding), và User Correction Path (khi học viên phản bác đánh giá của AI).

### c. Kiểm thử, Quality Bar & Phân công (`spec.md §7, §8, §9`)
- Thiết lập **Quality Bar cứng**: Pass rate ≥85% trên bộ Golden Set (22 cases) và **0% Hallucination** (tuyệt đối không bịa trích dẫn).
- **Thử nghiệm Multi-prototype (§8):** So sánh Phương án A (*AI tự động hỏi ngay dưới câu giải thích*) và Phương án B (*Hiện nút "Kiểm tra tôi xem"*). Tôi quyết định chọn Phương án A vì qua thử nghiệm nhanh, học viên thường lười bấm nút; việc AI tự động hỏi sẽ ép tạo tương tác và giúp học viên củng cố bài hiệu quả hơn.

### d. Thực thi Validation CP5 (`validation/feedback-log.md`) & Slide Demo
- Trực tiếp chạy vòng thử nghiệm CP5 với ≥5 người dùng ngoài nhóm (bao gồm học viên phòng lab).
- Thu thập phản hồi về 3 câu hỏi: (1) Câu hỏi kiểm tra có giúp nhớ bài không? (2) Giải thích đúng/sai có thuyết phục không? (3) Tương tác tự động có gây phiền không?
- Biên soạn file slide demo 6 trang (`demo-slides.pdf`) cô đọng từ bài toán, dữ liệu mining, giải pháp, kiến trúc rủi ro đến kết quả kiểm thử.

---

## 2. Ứng dụng AI nâng cao năng suất cá nhân (AI Support)

Trong quá trình đảm nhận vai trò Person D, tôi đã ứng dụng AI như một "Pair Architect" để hỗ trợ công việc:

1. **Rà soát & Stress-test thiết kế HAX/PAIR:** Tôi sử dụng AI để đối chiếu các hướng dẫn HAX của Microsoft và PAIR của Google với trải nghiệm EduTech. AI giúp tôi phát hiện ra rủi ro "quá tải tương tác" nếu AI tự động hỏi quá nhiều, từ đó đề xuất nguyên tắc G10 để thu hẹp phạm vi khi nghi ngờ.
2. **Generative Edge-case Mining:** Tôi dùng AI để giả lập các hành vi "bẫy" học viên hay dùng (như gõ thiếu từ, dùng từ lóng, hỏi dồn bài tập) nhằm sinh ra các test scenario phong phú cho bảng 4 lớp chỗ khó ở Spec §5.
3. **Phân tích Sentiment & Feedback Log:** Dùng AI hỗ trợ bóc tách nguyên văn feedback từ người dùng thử nghiệm ở mốc CP5, phân nhóm thành ưu điểm và điểm nghẽn UX để cập nhật chính xác vào Changelog (§9).

---

## 3. Failure Case Reflection

### 🔴 Case FAIL thực tế: C13 & C15 trong Lượt chạy Golden Set 1 (`eval/results-run1.md`)
Trong đợt đánh giá lần đầu tiên trên Golden Set 22 cases, nhóm chúng tôi đã gặp phải một thất bại quan trọng ở nhóm câu hỏi **Ambiguous (Mơ hồ)**:
- **C13:** Học viên hỏi *"Hôm nay lớp nói gì?"* (mong muốn: AI dùng intent `clarify` để hỏi lại xem học viên muốn hỏi buổi nào hay chủ đề nào).
- **C15:** Học viên gõ *"Tóm tắt"* (phạm vi không rõ ràng).
- **Kết quả:** Cả 2 case này AI Tutor đều phân loại sai thành `out_of_scope` và đưa ra câu từ chối cứng nhắc: *"Câu hỏi ngoài phạm vi tutor học thuật, vui lòng liên hệ TA"*.

### 🔍 Nguyên nhân gốc rễ (Root Cause Analysis):
Là người thiết kế Spec §4 & §5, tôi nhận ra lỗi xuất phát chính từ tư duy đặt **Guardrail quá cứng nhắc**:
- Khi viết quy tắc Guardrail chống hallucination ở Prompt v1.0, chúng tôi quá lo sợ việc AI trả lời man mạn nên đã siết quá chặt các câu từ chối.
- Hệ quả là Router Prompt bị rơi vào trạng thái **"Over-refusal" (Từ chối quá đà)**: Không phân biệt được ranh giới giữa một câu hỏi học thuật bị thiếu ngữ cảnh (cần dùng `G10` để hỏi lại) với một câu hỏi hành chính/giải bài tập hộ (cần dùng `G1` để từ chối).

### 💡 Bài học rút ra & Giải pháp khắc phục:
1. Thiết kế AI Spec không chỉ là đặt ra các luật cấm nghiêm ngặt, mà quan trọng hơn là phải thiết kế cơ chế ứng xử linh hoạt khi độ tin cậy của AI bị giảm sút. Với câu hỏi mơ hồ, giải pháp đúng UX là đặt câu hỏi mồi (Clarification turn) chứ không được từ chối thô bạo.
2. Chúng tôi đã bổ sung ví dụ vài mẫu (few-shot examples) phân định rõ giữa `clarify` và `out_of_scope`. Kết quả ở lượt chạy tiếp theo: Pass rate nhóm Ambiguous tăng từ **33% lên 100%**, đưa kết quả chung đạt **81.8%** (vượt Quality Bar 70%).
3. Qua sự cố này, tôi hiểu rằng nếu chỉ viết Spec trên giấy mà không nắm được logic Prompt Routing và RAG context bên dưới thì khi đi thi CP5/CP6 sẽ bị giám khảo xoáy sâu vào case fail và không giải thích được. Việc tham gia trực tiếp vào việc sửa prompt và phân tích log giúp tôi làm chủ 100% phần việc có tên mình.

---

## 4. Tự đánh giá & Hướng phát triển sản phẩm (Self-Assessment)
  - Chuyển luồng hỏi lại (Clarification flow) từ nhập văn bản sang dạng **Quick Replies / Chips (Gợi ý sẵn 2-3 lựa chọn)** để giảm tối đa gánh nặng thao tác cho học viên.
  - Thêm cài đặt tần suất câu hỏi kiểm tra (Cho phép học viên chọn: *Luôn hỏi tự động* / *Chỉ hỏi khi bấm nút*) dựa trên góp ý thu được từ CP5.
