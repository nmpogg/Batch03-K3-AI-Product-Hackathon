# VLearn Smart Tutor — AI Spec Hackathon Batch 03

**Hướng:** A — VLearn · **Loại:** Tính năng mới  
**Nhóm:** B1-D305

---

## Thành viên

| Mã HV | Họ và tên |
|---|---|
| 2A202601245 | Nguyễn Văn Đại |
| 2A202602025 | Ngô Minh Phong |
| 2A202601559 | Nguyễn Thùy Trang |
| 2A202602000 | Trần Hoàng Vũ |

---

## Phân công có tên từng phần

| Phần | Người chịu trách nhiệm | File/thư mục |
|---|---|---|
| Evidence: mining chatlog + khảo sát ≥20 người | **Nguyễn Văn Đại** | `eval/evidence-mining-log.md` · `eval/survey-log.md` |
| Spec §1 · User & Job | **Nguyễn Văn Đại** | `spec.md §1` |
| Spec §2 · Impact & quyết định chọn | **Nguyễn Văn Đại** | `spec.md §2` |
| Spec §3 · Giải pháp tương tự | **Nguyễn Văn Đại** | `spec.md §3` |
| Prompt engineering: system prompt, giải thích, sinh câu hỏi kiểm tra | **Ngô Minh Phong** | `codebase/prompt.md` |
| Prompt: đánh giá câu trả lời học viên (đúng/sai/gần đúng) | **Ngô Minh Phong** | `codebase/prompt.md` |
| Golden set ≥20 case + bảng kết quả các lượt chạy | **Ngô Minh Phong** | `eval/golden-set.csv` · `eval/results-*.md` |
| Frontend: giao diện chat, hiển thị lượt hỏi | **Nguyễn Thùy Trang** | `codebase/` |
| Flow câu hỏi kiểm tra + logic quota lượt hỏi (trừ/cộng) | **Nguyễn Thùy Trang** | `codebase/` |
| Tích hợp API + log lời gọi AI thật | **Nguyễn Thùy Trang** | `codebase/api-trace.log` |
| Spec §4 · Thiết kế + automation + nguyên tắc HAX/PAIR | **Trần Hoàng Vũ** | `spec.md §4` |
| Spec §5 · 4 lớp chỗ khó + ≥8 kịch bản rủi ro | **Trần Hoàng Vũ** | `spec.md §5` |
| Spec §6 · 4 đường đi trải nghiệm | **Trần Hoàng Vũ** | `spec.md §6` |
| Spec §7 · Kiểm thử + quality bar | **Trần Hoàng Vũ** | `spec.md §7` |
| Spec §8 · Phân công & kế hoạch + §9 Changelog | **Trần Hoàng Vũ** | `spec.md §8-§9` |
| Tổ chức vòng validation CP5 (≥5 người, log feedback) | **Trần Hoàng Vũ** | `validation/feedback-log.md` |
| Slide demo 6 trang | **Trần Hoàng Vũ** | `demo-slides.pdf` |

---

## Cấu trúc repo

```
repo/
├── README.md                        ← file này
├── spec.md                          ← AI Spec §1–§9
├── demo-slides.pdf                  ← slide 6 trang
├── CP1-canvas.md                    ← canvas nộp CP1
├── TEAM-PLAN.md                     ← kế hoạch làm việc nhóm
├── codebase/
│   ├── index.html (hoặc app/)       ← prototype
│   ├── prompt.md                    ← system prompt + prompt templates
│   └── api-trace.log                ← log lời gọi AI thật
├── eval/
│   ├── evidence-mining-log.md       ← log mining chatlog (chuẩn B)
│   ├── survey-log.md                ← log khảo sát ≥20 người (chuẩn A)
│   ├── golden-set.csv               ← ≥20 case kiểm thử
│   └── results-run1.md              ← bảng kết quả lượt chạy
├── validation/
│   └── feedback-log.md              ← ≥5 mẩu feedback có tên người thử
└── reflection/
    ├── reflection-nguyen-van-dai.md
    ├── reflection-ngo-minh-phong.md
    ├── reflection-nguyen-thuy-trang.md
    └── reflection-tran-hoang-vu.md
```

---

## Sản phẩm: VLearn Smart Tutor

**Lát cắt:**  
> Học viên đang ôn bài sau buổi học → hỏi AI tutor về khái niệm chưa rõ → AI giải thích có trích dẫn transcript [Buổi N · §M] và tự động đặt 1 câu hỏi kiểm tra → học viên trả lời đúng → hiểu sâu hơn + nhận lại 1 lượt hỏi.

**4 tính năng chính:**
1. Trả lời câu hỏi kèm trích dẫn transcript `[Buổi N · §M]`
2. Hỏi về nội dung bài học/slide hôm đó
3. Tự động sinh câu hỏi kiểm tra sau mỗi lần giải thích
4. Hệ thống lượt hỏi: 15 lượt/ngày · trả lời đúng → hoàn 1 lượt
