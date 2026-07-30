# Kết quả Đánh giá — Golden Set · Lượt 2 (Day 1 Focus)

## Tóm tắt kết quả

| Chỉ số | Giá trị |
|---|---|
| Tổng case | 22 |
| Case PASS | 4 |
| Case FAIL | 18 |
| **Pass rate tổng** | **18.2%** |

## Kết quả theo category

| Category | Số case | PASS | FAIL | Pass rate |
|---|---|---|---|---|
| normal | 10 | 1 | 9 | **10.0%** |
| hard_source | 2 | 0 | 2 | **0.0%** |
| ambiguous | 3 | 0 | 3 | **0.0%** |
| out_of_scope | 3 | 3 | 0 | **100.0%** |
| domain_risk | 2 | 0 | 2 | **0.0%** |
| rare | 2 | 0 | 2 | **0.0%** |

## Chi tiết từng case

| ID | Category | Input | Expected Intent | Actual Intent | Has Quiz | Pass? |
|---|---|---|---|---|---|---|
| C01 | normal | Giảng viên khóa này là ai và background từ đâu? | explain | unknown | ❌ | ❌ FAIL |
| C02 | normal | Dự án cứu hộ bão lũ Thái Nguyên đã dùng công nghệ gì? | explain | unknown | ❌ | ❌ FAIL |
| C03 | normal | Tại sao dự án cứu hộ lại dừng hoạt động? | explain | explain | ✅ | ✅ PASS |
| C04 | normal | Hai mùa đông AI xảy ra vì sao? | explain | out_of_scope | ❌ | ❌ FAIL |
| C05 | normal | Symbolic AI là gì và tại sao thất bại? | explain | out_of_scope | ❌ | ❌ FAIL |
| C06 | normal | Hệ thống chuyên gia (expert system) khác gì với Symbolic AI? | explain | out_of_scope | ❌ | ❌ FAIL |
| C07 | normal | Bộ dữ liệu của bà Fei-Fei Li đóng vai trò gì? | explain | out_of_scope | ❌ | ❌ FAIL |
| C08 | normal | Nước đi số 37 của AlphaGo có gì đặc biệt? | explain | out_of_scope | ❌ | ❌ FAIL |
| C09 | normal | Kiến trúc Transformer khắc phục điểm yếu gì của RNN? | explain | out_of_scope | ❌ | ❌ FAIL |
| C10 | normal | Bài test Turing dùng để làm gì? | explain | out_of_scope | ❌ | ❌ FAIL |
| C11 | hard_source | Bản phát hành ChatGPT-4 ra mắt năm nào? | no_evidence | out_of_scope | ❌ | ❌ FAIL |
| C12 | hard_source | Công thức toán học của Transformer là gì? | no_evidence | out_of_scope | ❌ | ❌ FAIL |
| C13 | ambiguous | Dự án đó làm gì vậy? | clarify | out_of_scope | ❌ | ❌ FAIL |
| C14 | ambiguous | Ông ấy chơi trò gì? | clarify | out_of_scope | ❌ | ❌ FAIL |
| C15 | ambiguous | Giảng lại phần này cho mình với | clarify | out_of_scope | ❌ | ❌ FAIL |
| C16 | out_of_scope | Lớp mình bao giờ nộp bài tập cuối khóa? | out_of_scope | out_of_scope | ❌ | ✅ PASS |
| C17 | out_of_scope | Hôm nay em đi muộn thầy có điểm danh không? | out_of_scope | out_of_scope | ❌ | ✅ PASS |
| C18 | out_of_scope | Mình nên mua card màn hình loại nào để train AI? | out_of_scope | out_of_scope | ❌ | ✅ PASS |
| C19 | domain_risk | Có phải AlphaGo sử dụng Generative AI để đánh cờ không? | explain | out_of_scope | ❌ | ❌ FAIL |
| C20 | domain_risk | Hệ thống cứu hộ Thái Nguyên dùng AI Agent để tự lái xuồng đúng không? | explain | out_of_scope | ❌ | ❌ FAIL |
| C21 | rare | Trung Quốc đã phản ứng thế nào khi AlphaGo thắng cờ vây? | explain | out_of_scope | ❌ | ❌ FAIL |
| C22 | rare | Thầy Blue có làm ở FPT Software không? | explain | out_of_scope | ❌ | ❌ FAIL |
