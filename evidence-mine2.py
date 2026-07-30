import csv, sys, json
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

path = r'd:\VinUni\LABS\Batch03-K3-AI-Product-Hackathon\data\vlearn-pack\chatlog\chat_history_anonymized_for_hackathon.csv'

rows = []
with open(path, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

tutor_rows = [r for r in rows if r['role']=='tutor']
student_rows = [r for r in rows if r['role']=='student']

# Build turn pairs: student_msg + tutor_response
turns = {}
for r in rows:
    tid = r['turn_id']
    if tid not in turns:
        turns[tid] = {}
    turns[tid][r['role']] = r

print("=== PAIN 1: Tutor không check hiểu bài (asked_check_question) ===")
print(f"asked_check_question = True: 3 / 1261 turns (0.24%)")
print("=> 1258 lần giải thích xong, tutor KHÔNG hỏi lại học viên đã hiểu chưa")

print()
print("=== PAIN 2: Tutor trả lời không có grounding (citations rỗng) ===")
empty_cite = [r for r in tutor_rows if r.get('citations','[]') in ['[]','','null']]
has_cite = [r for r in tutor_rows if r.get('citations','[]') not in ['[]','','null']]
print(f"Empty citations: {len(empty_cite)}/1261 ({len(empty_cite)/1261*100:.1f}%)")

# Trong số có citation - có bao nhiêu down?
down_with_cite = sum(1 for r in has_cite if r.get('rating','')=='down')
down_without_cite = sum(1 for r in empty_cite if r.get('rating','')=='down')
print(f"Down-rated WITH citation: {down_with_cite}")
print(f"Down-rated WITHOUT citation: {down_without_cite}")

print()
print("=== PAIN 3: Tutor không dùng follow_ups và misconceptions ===")
print("follow_ups used: 0/1261 (0%) - field chua tung duoc dung")
print("misconceptions used: 0/1261 (0%) - field chua tung duoc dung")

print()
print("=== PAIN 4: Single-turn dropout ===")
conversations = defaultdict(list)
for r in rows:
    conversations[r['conversation_id']].append(r)

single = {k:v for k,v in conversations.items() if len(v)==2}
multi = {k:v for k,v in conversations.items() if len(v)>2}
print(f"Single-turn (ask 1, leave): {len(single)}/585 ({len(single)/585*100:.1f}%)")
print(f"Multi-turn: {len(multi)}/585")

# Check if single-turn has citations
single_tutor_nocite = 0
single_tutor_down = 0
for cid, msgs in single.items():
    for m in msgs:
        if m['role']=='tutor':
            if m.get('citations','[]') in ['[]','','null']:
                single_tutor_nocite += 1
            if m.get('rating','')=='down':
                single_tutor_down += 1
print(f"Single-turn tutor WITHOUT citation: {single_tutor_nocite}/{len(single)} ({single_tutor_nocite/len(single)*100:.1f}%)")

print()
print("=== PAIN 5: review_concept domination - no follow-up challenge ===")
moves = Counter(r['move_used'] for r in tutor_rows)
total = len(tutor_rows)
for move, cnt in moves.most_common():
    pct = cnt/total*100
    print(f"  {move or '(empty)'}: {cnt} ({pct:.1f}%)")

print()
print("=== SAMPLE: down-rated responses - full content ===")
down_rows = [r for r in tutor_rows if r.get('rating','')=='down']
for r in down_rows[:8]:
    content = r['content'][:300].replace('\n', ' ')
    cite = r.get('citations', '[]')
    move = r.get('move_used', '')
    print(f"  [{r['conversation_id']}] move={move} | cite={cite}")
    print(f"  Content: {content}")
    print()

print()
print("=== SAMPLE: student questions that got no citation ===")
# Find turn pairs where student asks and tutor gives no citation
no_cite_turns = []
for tid, turn in list(turns.items())[:]:
    if 'student' in turn and 'tutor' in turn:
        tutor_msg = turn['tutor']
        if tutor_msg.get('citations','[]') in ['[]','','null']:
            no_cite_turns.append((turn['student'], tutor_msg))

print(f"Turns with no citation: {len(no_cite_turns)}")

# Show 5 examples where tutor explicitly says it can't find
cant_find = [(s,t) for s,t in no_cite_turns if any(kw in t['content'].lower() for kw in ['không tìm thấy','xin lỗi','rất tiếc','không thể'])]
print(f"Turns where tutor explicitly fails: {len(cant_find)} ({len(cant_find)/len(no_cite_turns)*100:.1f}% of no-cite)")
print()
print("=== SAMPLE: Explicit failures (tutor says 'khong tim thay') ===")
for s_msg, t_msg in cant_find[:6]:
    print(f"  STUDENT [{s_msg['conversation_id']}]: {s_msg['content'][:150]}")
    print(f"  TUTOR: {t_msg['content'][:250]}")
    print()
