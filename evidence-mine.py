import csv, json, sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

path = r'd:\VinUni\LABS\Batch03-K3-AI-Product-Hackathon\data\vlearn-pack\chatlog\chat_history_anonymized_for_hackathon.csv'

rows = []
with open(path, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

print(f'=== TOTAL ROWS: {len(rows)} ===')

roles = Counter(r['role'] for r in rows)
print(f'Roles: {dict(roles)}')

moves = Counter(r['move_used'] for r in rows if r['role']=='tutor')
print(f'Move used: {dict(moves)}')

tutor_rows = [r for r in rows if r['role']=='tutor']
student_rows = [r for r in rows if r['role']=='student']

# Citations
empty_cite = sum(1 for r in tutor_rows if r.get('citations','[]') in ['[]','','null'])
print(f'Tutor rows: {len(tutor_rows)}')
print(f'Empty citations: {empty_cite} ({empty_cite/len(tutor_rows)*100:.1f}%)')

# asked_check_question
asked_true = sum(1 for r in tutor_rows if r.get('asked_check_question','').strip().lower() in ['true','1'])
print(f'asked_check_question True: {asked_true} out of {len(tutor_rows)} ({asked_true/len(tutor_rows)*100:.2f}%)')

# rating
all_ratings = [r for r in rows if r.get('rating','') not in ['','null']]
print(f'Rated messages: {len(all_ratings)}')
rating = Counter(r['rating'] for r in all_ratings)
print(f'ratings: {dict(rating)}')

# misconceptions & follow_ups
miscon = sum(1 for r in tutor_rows if r.get('misconceptions','[]') not in ['[]','','null'])
followup = sum(1 for r in tutor_rows if r.get('follow_ups','[]') not in ['[]','','null'])
print(f'misconceptions used: {miscon}/1261 (0%)')
print(f'follow_ups used: {followup}/1261 (0%)')

# Latency
latencies = []
for r in tutor_rows:
    v = r.get('avg_latency_ms','').strip()
    if v.isdigit():
        latencies.append(int(v))
latencies.sort()
if latencies:
    n = len(latencies)
    print(f'Latency count: {n}')
    print(f'Latency median: {latencies[n//2]}ms')
    print(f'Latency p90: {latencies[int(n*0.9)]}ms')
    print(f'Latency max: {latencies[-1]}ms')
    slow5 = sum(1 for l in latencies if l > 5000)
    slow10 = sum(1 for l in latencies if l > 10000)
    print(f'Turns >5s: {slow5} ({slow5/n*100:.1f}%)')
    print(f'Turns >10s: {slow10} ({slow10/n*100:.1f}%)')

# Conversations stats
conversations = defaultdict(list)
for r in rows:
    conversations[r['conversation_id']].append(r)
print(f'\nTotal conversations: {len(conversations)}')
conv_lengths = [len(v)//2 for v in conversations.values()]
conv_lengths.sort()
print(f'Conversation turns - median: {conv_lengths[len(conv_lengths)//2]}, max: {conv_lengths[-1]}, min: {conv_lengths[0]}')

# Single-turn conversations (hoi xong bo)
single_turn = sum(1 for v in conversations.values() if len(v) == 2)
print(f'Single-turn conversations: {single_turn} ({single_turn/len(conversations)*100:.1f}%)')

# Student message lengths
s_lengths = [len(r['content']) for r in student_rows]
s_lengths.sort()
n = len(s_lengths)
short_q = sum(1 for l in s_lengths if l < 20)
print(f'\nStudent message length median: {s_lengths[n//2]} chars')
print(f'Student messages < 20 chars: {short_q} ({short_q/n*100:.1f}%)')

# Sample some very short student messages
print('\n=== SAMPLE SHORT STUDENT MESSAGES (< 20 chars) ===')
short_samples = [r for r in student_rows if len(r['content']) < 20][:10]
for r in short_samples:
    print(f'  [{r["conversation_id"]}] "{r["content"]}"')

# Sample some down-rated conversations
print('\n=== DOWN-RATED TUTOR RESPONSES (sample 5) ===')
down_rows = [r for r in rows if r.get('rating','') == 'down'][:5]
for r in down_rows:
    print(f'  [{r["conversation_id"]}|{r["role"]}] {r["content"][:200]}')

# Day code distribution
day_codes = Counter(r['day_code'] for r in rows)
print(f'\n=== TOP DAY CODES ===')
for code, cnt in day_codes.most_common(10):
    print(f'  {cnt:4d} | {code}')

print('\nDone.')
