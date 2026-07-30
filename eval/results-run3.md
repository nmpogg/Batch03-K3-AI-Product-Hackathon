# Kết quả Đánh giá — Golden Set · Lượt 3 (Day 1 Focus - Fixed Quota)

## Tóm tắt kết quả

| Chỉ số | Giá trị |
|---|---|
| Tổng case | 22 |
| Case PASS | 15 |
| Case FAIL | 7 |
| **Pass rate tổng** | **68.2%** |

## Kết quả theo category

| Category | Số case | PASS | FAIL | Pass rate |
|---|---|---|---|---|
| normal | 10 | 7 | 3 | **70.0%** |
| hard_source | 2 | 2 | 0 | **100.0%** |
| ambiguous | 3 | 1 | 2 | **33.3%** |
| out_of_scope | 3 | 2 | 1 | **66.7%** |
| domain_risk | 2 | 1 | 1 | **50.0%** |
| rare | 2 | 2 | 0 | **100.0%** |

## Chi tiết từng case

| ID | Category | Input | Expected Intent | Actual Intent | Has Quiz | Pass? |
|---|---|---|---|---|---|---|
| C01 | normal | Giảng viên khóa này là ai và background từ đâu? | explain | instructor_background | ❌ | ❌ FAIL |
| C02 | normal | Dự án cứu hộ bão lũ Thái Nguyên đã dùng công nghệ gì? | explain | explain | ✅ | ✅ PASS |
| C03 | normal | Tại sao dự án cứu hộ lại dừng hoạt động? | explain | explain | ✅ | ✅ PASS |
| C04 | normal | Hai mùa đông AI xảy ra vì sao? | explain | explain | ✅ | ✅ PASS |
| C05 | normal | Symbolic AI là gì và tại sao thất bại? | explain | explain | ✅ | ✅ PASS |
| C06 | normal | Hệ thống chuyên gia (expert system) khác gì với Symbolic AI? | explain | explain | ✅ | ✅ PASS |
| C07 | normal | Bộ dữ liệu của bà Fei-Fei Li đóng vai trò gì? | explain | explain | ❌ | ❌ FAIL |
| C08 | normal | Nước đi số 37 của AlphaGo có gì đặc biệt? | explain | explain | ❌ | ❌ FAIL |
| C09 | normal | Kiến trúc Transformer khắc phục điểm yếu gì của RNN? | explain | explain | ✅ | ✅ PASS |
| C10 | normal | Bài test Turing dùng để làm gì? | explain | explain | ✅ | ✅ PASS |
| C11 | hard_source | Bản phát hành ChatGPT-4 ra mắt năm nào? | no_evidence | no_evidence | ✅ | ✅ PASS |
| C12 | hard_source | Công thức toán học của Transformer là gì? | no_evidence | no_evidence | ✅ | ✅ PASS |
| C13 | ambiguous | Dự án đó làm gì vậy? | clarify | explain | ✅ | ❌ FAIL |
| C14 | ambiguous | Ông ấy chơi trò gì? | clarify | clarify | ✅ | ✅ PASS |
| C15 | ambiguous | Giảng lại phần này cho mình với | clarify | explain | ✅ | ❌ FAIL |
| C16 | out_of_scope | Lớp mình bao giờ nộp bài tập cuối khóa? | out_of_scope | out_of_scope | ❌ | ✅ PASS |
| C17 | out_of_scope | Hôm nay em đi muộn thầy có điểm danh không? | out_of_scope | out_of_scope | ❌ | ✅ PASS |
| C18 | out_of_scope | Mình nên mua card màn hình loại nào để train AI? | out_of_scope | no_evidence | ✅ | ❌ FAIL |
| C19 | domain_risk | Có phải AlphaGo sử dụng Generative AI để đánh cờ không? | explain | explain | ✅ | ✅ PASS |
| C20 | domain_risk | Hệ thống cứu hộ Thái Nguyên dùng AI Agent để tự lái xuồng đúng không? | explain | no_evidence | ✅ | ❌ FAIL |
| C21 | rare | Trung Quốc đã phản ứng thế nào khi AlphaGo thắng cờ vây? | explain | explain | ✅ | ✅ PASS |
| C22 | rare | Thầy Blue có làm ở FPT Software không? | explain | explain | ✅ | ✅ PASS |
