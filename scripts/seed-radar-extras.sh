#!/bin/bash
# seed-radar-extras.sh
# Run this AFTER applying supabase/migrations/20260506_radar_extras.sql in Supabase Studio
# Usage: ./scripts/seed-radar-extras.sh

SUPABASE_URL="${VITE_SUPABASE_URL:-https://xwcmvemayjjcfyjhdkii.supabase.co}"
ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}"

if [ -z "$ANON_KEY" ]; then
  # Try loading from .env
  if [ -f "$(dirname "$0")/../.env" ]; then
    export $(grep -v "^#" "$(dirname "$0")/../.env" | xargs)
    SUPABASE_URL="${VITE_SUPABASE_URL:-$SUPABASE_URL}"
    ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}"
  fi
fi

if [ -z "$ANON_KEY" ]; then
  echo "ERROR: VITE_SUPABASE_ANON_KEY not set. Run from project root or export the variable."
  exit 1
fi

echo "Seeding radar_metrics..."

/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_metrics" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "week_of": "2026-05-06",
    "channel": "craig_linkedin",
    "post_impressions": 65,
    "followers": 18312,
    "profile_viewers": 205,
    "search_appearances": 106,
    "posts_published": 0,
    "comments_received": 0,
    "likes_received": 0,
    "notes": "Day 0 baseline — before first post goes live"
  }'
echo " - radar_metrics baseline inserted"

echo "Seeding radar_assets (10 assets)..."

seed_asset() {
  local name="$1"
  local type="$2"
  local content="$3"
  
  /usr/bin/curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "$(python3 -c "import json; print(json.dumps({'name': '$name', 'asset_type': '$type', 'content': open('/dev/stdin').read(), 'status': 'draft'}))" <<< "$content")"
  echo " - $name"
}

# 1. Tagline
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Searchline Tagline","asset_type":"linkedin_page","content":"Hiring intelligence for senior roles.","status":"draft"}'
echo " - Searchline Tagline"

# 2. Short Description
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Searchline Short Description","asset_type":"linkedin_page","content":"Hiring intelligence for senior roles. Better candidate experience. Smarter shortlists. Built for teams that hire for quality.","status":"draft"}'
echo " - Searchline Short Description"

# 3. About Section
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Searchline About Section","asset_type":"linkedin_page","content":"Most hiring processes were not built for senior roles.\n\nThey were built for volume — fast screening, automated filters, high-throughput applicant management. That works when you are hiring at scale and the cost of a wrong decision is low.\n\nSenior hiring is a different problem. The best candidates are not applying. The brief is complex. The decision takes months and costs real money to get wrong. And the standard tools — job boards, ATS, LinkedIn Recruiter — were not designed with any of that in mind.\n\nSearchline is built for this specific problem.\n\nWe combine executive search expertise with AI to help hiring teams run better senior hiring processes. That means smarter briefing, better candidate reach, more consistent assessment, and a candidate experience that reflects well on your company.\n\nOur AI, Erica, works alongside hiring teams throughout the process — helping structure the brief, identifying the right candidate profile, and ensuring the process is as good for the candidate as it is for the employer.\n\nThe result: better shortlists, faster decisions, and a hiring process that actually works at the senior level.\n\nWe work with in-house HR teams, hiring managers and talent leads hiring for senior commercial roles — VP Sales, CRO, Sales Director, CCO and equivalent.\n\nSearchline is built by Second Orbit.","status":"draft"}'
echo " - Searchline About Section"

# 4. Banner Copy
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Searchline Banner Copy","asset_type":"linkedin_page","content":"Primary: Hiring intelligence for senior roles.\nSecondary: Searchline — built for teams that hire for quality, not volume.\n\nDesign direction: Dark background (#020617 or similar), clean sans-serif, no stock imagery. Could include a subtle grid/data motif. Keep it minimal.","status":"draft"}'
echo " - Searchline Banner Copy"

# 5. Post A
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Starter Post A — Launch","asset_type":"linkedin_post","content":"Most companies use the same hiring process for a VP Sales as they do for a graduate. That'\''s the problem we'\''re solving.\n\nVolume hiring tools work well for what they were designed for. Fast, scalable, efficient. When you need to process hundreds of applications and the priority is throughput, they'\''re fine.\n\nBut senior hiring doesn'\''t work like that.\n\nThe best candidate for your VP Sales role isn'\''t on a job board. They'\''re not checking LinkedIn Recruiter messages. They'\''re in a job, probably doing well, and they'\''d consider moving — but only for the right thing, presented the right way.\n\nStandard hiring infrastructure misses them entirely.\n\nSearchline is built for senior hiring specifically. AI-assisted briefing, better candidate reach, consistent assessment, and a process that treats senior professionals like senior professionals.\n\nWe'\''re in early access. If you'\''re hiring for senior commercial roles and want to see how it works, reach out.\n\n#SeniorHiring #HiringIntelligence #ExecutiveSearch","status":"draft"}'
echo " - Starter Post A — Launch"

# 6. Post B
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Starter Post B — Candidate Experience","asset_type":"linkedin_post","content":"The hiring process is the first proof point that your company is worth joining.\n\nBefore an offer is made. Before culture fit is assessed. Before the package is on the table — a candidate has already formed a view of your company based entirely on how you ran the process.\n\nWere they kept informed? Was the brief clear? Did the interviewers seem prepared? Was feedback real?\n\nSenior candidates are evaluating you throughout. They have options. They talk to people. And how you treat them during a process — especially if they don'\''t get the role — stays with them.\n\nThe companies that consistently attract strong senior talent take this seriously. The process isn'\''t separate from the employer brand. It is the employer brand, in practice.\n\nA better process isn'\''t just about the candidate who gets the offer. It'\''s about every candidate who walked away with an impression of your company.\n\n#CandidateExperience #SeniorHiring #EmployerBrand #Hiring","status":"draft"}'
echo " - Starter Post B — Candidate Experience"

# 7. Post C
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Starter Post C — Passive Candidates","asset_type":"linkedin_post","content":"The candidate you actually want for this role probably isn'\''t looking.\n\nThis isn'\''t a cynical take. It'\''s just how senior hiring works.\n\nStrong performers at Director and VP level are usually in roles. They'\''re not monitoring job boards. They haven'\''t refreshed their CV. They respond selectively to LinkedIn messages — if at all.\n\nWhich means the standard hiring process, built around inbound applications, systematically misses them.\n\nReaching passive candidates at senior level requires a different approach. A sharper brief — not a job spec, but a genuine articulation of why this is an interesting move. Direct, relevant outreach that shows you'\''ve actually looked at their background. And a process that respects their time and moves at a sensible pace.\n\nThe infrastructure to do this well exists. Most companies aren'\''t using it.\n\n#PassiveCandidates #ExecutiveSearch #SeniorHiring #TalentStrategy","status":"draft"}'
echo " - Starter Post C — Passive Candidates"

# 8. Post D
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Starter Post D — Erica Introduction","asset_type":"linkedin_post","content":"We built an AI to help hiring teams do senior hiring properly. Here'\''s what she does.\n\nErica is Searchline'\''s hiring intelligence layer. She works alongside hiring teams throughout a senior search — not to replace judgment, but to make the process more consistent, more thorough, and less dependent on things going right by chance.\n\nWhat that looks like in practice:\n\nShe helps structure the brief. Most hiring processes fail before they start because the brief isn'\''t clear enough. Erica asks the right questions upfront so everyone is aligned on what good looks like.\n\nShe identifies the right candidate profile. Not just a job spec, but a realistic picture of who exists in the market and what will actually attract them.\n\nShe supports consistent assessment. The same criteria, applied the same way, across every candidate.\n\nErica isn'\''t a recruitment bot. She'\''s not sending automated LinkedIn messages or screening CVs against keywords. She'\''s designed to make the parts of senior hiring that require judgment more structured and less variable.\n\nMore on how she works coming soon.\n\n#HiringIntelligence #AIHiring #ExecutiveSearch #Searchline","status":"draft"}'
echo " - Starter Post D — Erica Introduction"

# 9. Post E
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Starter Post E — The Brief Problem","asset_type":"linkedin_post","content":"Most hiring processes fail at the brief. Everything that goes wrong downstream started there.\n\nThe job spec says \"5+ years experience, strong communicator, commercially focused.\" The hiring manager has a completely different picture in their head. The talent team is working off a third interpretation. The interviewers haven'\''t been told what to assess.\n\nNobody catches this at the start. It surfaces weeks in, when four interviewers debrief and realise they were evaluating four different roles.\n\nA good brief doesn'\''t just describe the role. It aligns everyone on: what does strong actually look like? What'\''s non-negotiable versus nice-to-have? What'\''s the realistic candidate profile given the market? What does success in this role look like in 12 months?\n\nGetting that alignment upfront changes everything downstream. Faster decisions. Fewer wasted interviews. Better shortlists. And a candidate experience that doesn'\''t feel disorganised.\n\nThe brief is the highest-leverage moment in any hiring process. Most companies spend the least time on it.\n\n#HiringProcess #SeniorHiring #TalentAcquisition #BetterHiring","status":"draft"}'
echo " - Starter Post E — The Brief Problem"

# 10. Erica Field Notes intro
/usr/bin/curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/radar_assets" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"Erica Field Notes — Intro Post","asset_type":"erica_field_note","content":"Introducing Erica Field Notes.\n\nErica is Searchline'\''s AI — she works alongside hiring teams on senior searches. Field Notes are her observations from the hiring process: patterns in how candidates prepare, how hiring teams decide, where processes go wrong, and what the data shows.\n\nThey'\''re not opinions. They'\''re patterns.\n\nWe'\''ll be publishing Field Notes regularly. If you work in hiring, talent, or executive search — or if you'\''re a senior professional navigating your career — they'\''ll be worth following.\n\nFirst note coming this week.\n\n*Erica Field Notes are observations from Searchline'\''s hiring intelligence data.*\n\n#EricaFieldNotes #HiringIntelligence #Searchline #ExecutiveSearch","status":"draft"}'
echo " - Erica Field Notes — Intro Post"

echo ""
echo "Done! All radar_assets seeded."
