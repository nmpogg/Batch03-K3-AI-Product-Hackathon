import csv
import json
import urllib.request
import urllib.error
import time

API_URL = "http://localhost:5173/api/chat"
GOLDEN_SET_PATH = "golden-set.csv"
OUTPUT_MD_PATH = "results-run3.md"

def test_chatbot(question, category, q_id=None, retries=3):
    data = json.dumps({
        "messages": [{"role": "user", "content": question}],
        "context": {
            "courseTitle": "AI thực chiến K3",
            "lessonTitle": "Day 1: AI & LLM Foundation",
            "slideName": "day01_302.pdf",
            "page": 1,
            "selection": ""
        },
        "userId": q_id or "eval_script"
    }).encode("utf-8")

    req = urllib.request.Request(API_URL, data=data, headers={"Content-Type": "application/json"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                res_body = response.read().decode("utf-8")
                return json.loads(res_body)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"Rate limited (429) on '{question}'. Retrying in 10s...")
                time.sleep(10)
                continue
            print(f"HTTPError {e.code} testing '{question}': {e}")
            return None
        except Exception as e:
            print(f"Error testing '{question}': {e}")
            return None
    return None

def run_eval():
    results = []
    pass_count = 0
    fail_count = 0
    categories = {}

    with open(GOLDEN_SET_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row['id']: continue
            q = row['input_question']
            cat = row['category']
            expected_intent = row['expected_intent']
            
            if cat not in categories:
                categories[cat] = {"pass": 0, "fail": 0, "total": 0}
            categories[cat]["total"] += 1
            
            print(f"Testing {row['id']}: {q}")
            res = test_chatbot(q, cat, row['id'])
            
            # Simple check
            actual_intent = "unknown"
            has_quiz = False
            is_pass = False
            
            if res and res.get("intent"):
                actual_intent = res["intent"]
                if res.get("quiz") and res["quiz"].get("question"):
                    has_quiz = True
                
                # Check criteria
                if actual_intent == expected_intent:
                    if actual_intent == "explain" and not has_quiz:
                        is_pass = False
                    else:
                        is_pass = True

            if is_pass:
                pass_count += 1
                categories[cat]["pass"] += 1
            else:
                fail_count += 1
                categories[cat]["fail"] += 1
                
            results.append({
                "id": row['id'],
                "category": cat,
                "input": q,
                "expected": expected_intent,
                "actual": actual_intent,
                "has_quiz": "✅" if has_quiz else "❌",
                "is_pass": "✅ PASS" if is_pass else "❌ FAIL"
            })
            
            time.sleep(4) # delay to avoid rate limit

    # Write report
    with open(OUTPUT_MD_PATH, "w", encoding="utf-8") as f:
        f.write("# Kết quả Đánh giá — Golden Set · Lượt 3 (Day 1 Focus - Fixed Quota)\n\n")
        f.write("## Tóm tắt kết quả\n\n")
        f.write("| Chỉ số | Giá trị |\n|---|---|\n")
        f.write(f"| Tổng case | {pass_count + fail_count} |\n")
        f.write(f"| Case PASS | {pass_count} |\n")
        f.write(f"| Case FAIL | {fail_count} |\n")
        pass_rate = (pass_count / (pass_count + fail_count) * 100) if (pass_count + fail_count) > 0 else 0
        f.write(f"| **Pass rate tổng** | **{pass_rate:.1f}%** |\n\n")
        
        f.write("## Kết quả theo category\n\n")
        f.write("| Category | Số case | PASS | FAIL | Pass rate |\n|---|---|---|---|---|\n")
        for cat, stats in categories.items():
            rate = (stats["pass"] / stats["total"] * 100) if stats["total"] > 0 else 0
            f.write(f"| {cat} | {stats['total']} | {stats['pass']} | {stats['fail']} | **{rate:.1f}%** |\n")
            
        f.write("\n## Chi tiết từng case\n\n")
        f.write("| ID | Category | Input | Expected Intent | Actual Intent | Has Quiz | Pass? |\n")
        f.write("|---|---|---|---|---|---|---|\n")
        for r in results:
            f.write(f"| {r['id']} | {r['category']} | {r['input']} | {r['expected']} | {r['actual']} | {r['has_quiz']} | {r['is_pass']} |\n")

if __name__ == "__main__":
    run_eval()
