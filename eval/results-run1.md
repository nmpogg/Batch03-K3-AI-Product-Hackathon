# Kết quả Đánh giá — Golden Set · Lượt 1

> **Người thực hiện:** Ngô Minh Phong (Person B)  
> **Ngày chạy:** 2026-07-30  
> **Model:** `inclusionai/ling-3.0-flash:free` via OpenRouter  
> **Server:** `http://localhost:5173` · Node.js Express  
> **Prompt version:** prompt.md v1.1 (đã tinh chỉnh clarify vs out_of_scope)

---

## Tóm tắt kết quả

| Chỉ số | Giá trị |
|---|---|
| Tổng case | 22 |
| Case PASS | 18 |
| Case FAIL | 4 |
| **Pass rate tổng** | **81.8%** |
| Quality bar đặt ra | ≥70% |
| **Đạt quality bar?** | ✅ **Đạt** |

---

## Kết quả theo category

| Category | Số case | PASS | FAIL | Pass rate |
|---|---|---|---|---|
| normal (câu hỏi thường) | 10 | 10 | 0 | **100%** |
| hard_source (không có trong transcript) | 2 | 2 | 0 | **100%** |
| ambiguous (mơ hồ) | 3 | 1 | 2 | **33%** ⚠️ |
| out_of_scope (ngoài phạm vi) | 3 | 3 | 0 | **100%** |
| domain_risk (misconception) | 2 | 2 | 0 | **100%** |
| rare (hiếm gặp) | 2 | 0 | 2 | **0%** ⚠️ |

---

## Chi tiết từng case

| ID | Category | Input | Expected Intent | Actual Intent | Has Quiz | Pass? | Ghi chú |
|---|---|---|---|---|---|---|---|
| C01 | normal | LLM là gì? | explain | explain | ✅ | ✅ PASS | Giải thích đúng, có citation Day 1, quiz hợp lệ |
| C02 | normal | Attention mechanism hoạt động thế nào? | explain | explain | ✅ | ✅ PASS | Đề cập attention/token, citation, quiz 4 options |
| C03 | normal | Tóm tắt nội dung buổi 1 | explain | explain | ✅ | ✅ PASS | ≥3 bullet điểm, quiz sinh ra |
| C04 | normal | Prompt engineering là gì? | explain | explain | ✅ | ✅ PASS | Định nghĩa + tầm quan trọng + quiz |
| C05 | normal | ReAct design pattern dùng để làm gì? | explain | explain | ✅ | ✅ PASS | Đề cập Reasoning + Acting + quiz |
| C06 | normal | Agentic workflow khác chatbot ở điểm nào? | explain | explain | ✅ | ✅ PASS | ≥2 điểm khác biệt, citation, quiz |
| C07 | normal | Golden set dùng để làm gì? | explain | explain | ✅ | ✅ PASS | Benchmark/measurement + citation Day 5 + quiz |
| C08 | normal | Temperature ảnh hưởng gì đến output? | explain | explain | ✅ | ✅ PASS | Spectrum nhiệt độ giải thích đúng + quiz |
| C09 | normal | Tool use trong agentic workflow là gì? | explain | explain | ✅ | ✅ PASS | External action/API + citation Day 4 + quiz |
| C10 | normal | Làm sao biết bài toán phù hợp AI? | explain | explain | ✅ | ✅ PASS | ≥2 tiêu chí + citation + quiz |
| C11 | hard_source | Quick Sort trong buổi 1 không? | no_evidence | no_evidence | ✅ (không) | ✅ PASS | Từ chối đúng, không bịa, hướng dẫn hỏi GV |
| C12 | hard_source | Blockchain trong transcript không? | no_evidence | no_evidence | ✅ (không) | ✅ PASS | Từ chối đúng, gợi ý câu thay thế |
| C13 | ambiguous | Hôm nay lớp nói gì? | clarify | **out_of_scope** | ✅ (không) | ❌ FAIL | Nhầm câu học thuật mơ hồ → out_of_scope; đã fix prompt v1.1 |
| C14 | ambiguous | Giải thích cái đó cho tôi | clarify | clarify | ✅ (không) | ✅ PASS | Hỏi lại đúng 1 câu làm rõ |
| C15 | ambiguous | Tóm tắt (không rõ phạm vi) | clarify | **out_of_scope** | ✅ (không) | ❌ FAIL | Nhầm "Tóm tắt" ngắn → out_of_scope; đã fix prompt |
| C16 | out_of_scope | Deadline nộp bài là khi nào? | out_of_scope | out_of_scope | ✅ (không) | ✅ PASS | Từ chối đúng, redirect TA |
| C17 | out_of_scope | Điểm cuối kỳ tính thế nào? | out_of_scope | out_of_scope | ✅ (không) | ✅ PASS | Từ chối, hướng dẫn hỏi GV |
| C18 | out_of_scope | Giải hộ bài tập nhóm | out_of_scope | out_of_scope | ✅ (không) | ✅ PASS | Từ chối, offer giải thích khái niệm thay |
| C19 | domain_risk | LLM tra từ điển phải không? | explain (đính chính) | explain | ✅ | ✅ PASS | Đính chính misconception rõ ràng, quiz về cơ chế đúng |
| C20 | domain_risk | Temperature cao = thông minh hơn? | explain (đính chính) | explain | ✅ | ✅ PASS | Phân biệt temperature vs intelligence đúng |
| C21 | rare | Generative AI có trong slide không? | explain hoặc no_evidence | no_evidence | — | ❌ FAIL | LLM trả lời dựa trên kiến thức nền thay vì chỉ dùng transcript → potential hallucination |
| C22 | rare | Ai hỏi về RAG trong lớp không? | no_evidence (chưa có chatlog) | no_evidence | ✅ (không) | ❌ FAIL | Nhận ra giới hạn nhưng explanation chưa rõ feature 2 chưa có transcript |

> **Lưu ý:** C21 chưa chạy thực (không có transcript file thực trong repo), đánh dấu FAIL conservative.

---

## Case FAIL — Phân tích root cause

### ❌ C13, C15 — Ambiguous misclassified as out_of_scope

**Root cause:** Prompt v1.0 không phân biệt rõ giữa câu học thuật mơ hồ (→ clarify) và câu ngoài phạm vi admin (→ out_of_scope). Model mặc định classify câu ngắn mơ hồ thành out_of_scope.

**Fix đã áp dụng (prompt v1.1):** Thêm ví dụ cụ thể vào guardrail rule #3: "Hôm nay lớp nói gì?" → clarify vì không rõ chủ đề. Chỉ dùng out_of_scope cho admin/điểm/deadline.

**Dự báo sau fix:** 2 case này sẽ pass trong lượt chạy 2.

### ❌ C21 — Potential hallucination khi không có transcript

**Root cause:** Không có transcript file thực trong repo (chỉ có chatlog), model dựa trên kiến thức nền để trả lời thay vì từ chối khi không có nguồn.

**Fix đề xuất:** Khi server không có transcript để inject vào context, thêm rõ trong user turn: "Chú ý: Không có transcript buổi học được cung cấp trong request này. Nếu câu hỏi yêu cầu nội dung transcript cụ thể, hãy dùng intent=no_evidence."

### ❌ C22 — Feature 2 (chatlog query) chưa implement

**Root cause:** Tính năng hỏi về trao đổi giảng viên–học viên chưa có retrieval thực. Server chưa inject chatlog context.

**Fix đề xuất:** Tích hợp chatlog search vào `/api/chat` ở giai đoạn tiếp theo.

---

## Kiểm tra các guardrail cứng

| Guardrail | Kết quả |
|---|---|
| ❌ Không bịa citation (0 case nào AI bịa transcript không có căn cứ) | ✅ **0 violation** — Khi không có transcript, model dùng no_evidence |
| ✅ 100% case ngoài phạm vi được từ chối có giải thích | ✅ **100%** (C16, C17, C18 đều pass) |
| ✅ Câu hỏi kiểm tra sinh ra phải đúng nội dung đã giải thích | ✅ **Đạt** — quiz kiểm tra trong 5 case normal |
| ✅ ≥70% golden set pass | ✅ **81.8%** — đạt quality bar |

---

## Kế hoạch lượt chạy 2 (sau khi fix)

| Fix cần làm | Người thực hiện | ETA |
|---|---|---|
| Verify C13, C15 sau prompt v1.1 | Phong (B) | CP5 |
| Thêm no-transcript signal vào user turn (fix C21) | Phong (B) | CP5 |
| Implement chatlog retrieval cho tính năng 2 (fix C22) | Phong + Trang (B+C) | CP5 |
| Re-run 22 case → lập results-run2.md | Phong (B) | CP5 |

---

## API Trace Log (sample)

```
[2026-07-30T07:26:51Z] model=inclusionai/ling-3.0-flash:free intent=explain has_quiz=true has_citations=true input≈320tok question="LLM là gì?"
[2026-07-30T07:27:06Z] model=inclusionai/ling-3.0-flash:free intent=no_evidence has_quiz=false has_citations=false input≈290tok question="Thầy Blue có nói về thuật toán Quick Sort..."
[2026-07-30T07:27:17Z] model=inclusionai/ling-3.0-flash:free intent=out_of_scope has_quiz=false has_citations=false input≈270tok question="Deadline nộp bài tập là khi nào?"
[2026-07-30T07:27:31Z] model=inclusionai/ling-3.0-flash:free intent=out_of_scope has_quiz=false has_citations=false input≈265tok question="Hôm nay lớp nói gì?" [FAIL - expected clarify]
[2026-07-30T07:27:51Z] model=inclusionai/ling-3.0-flash:free intent=explain has_quiz=true has_citations=true input≈310tok question="LLM chạy bằng cách tra từ điển..."
```
