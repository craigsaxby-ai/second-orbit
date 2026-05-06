/**
 * Radar Posts Seeding Script
 * Run with: node scripts/seed-radar.mjs
 * 
 * NOTE: The radar_posts table must be created first via Supabase SQL Editor:
 * https://xwcmvemayjjcfyjhdkii.supabase.co/project/default/sql/new
 * 
 * SQL to run:
 * CREATE TABLE IF NOT EXISTS radar_posts (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   date DATE,
 *   channel TEXT,
 *   format TEXT,
 *   topic TEXT,
 *   hook TEXT,
 *   draft_text TEXT,
 *   risk_status TEXT,
 *   risk_notes TEXT,
 *   status TEXT DEFAULT 'drafted',
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   updated_at TIMESTAMPTZ DEFAULT now()
 * );
 * ALTER TABLE radar_posts ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow all" ON radar_posts FOR ALL USING (true) WITH CHECK (true);
 */

const SUPABASE_URL = 'https://xwcmvemayjjcfyjhdkii.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const posts = [
  {
    date: '2026-05-07',
    channel: 'CL',
    format: 'Post',
    topic: 'Interview Intelligence — Preparation',
    hook: 'Most senior candidates under-prepare for interviews. Here\'s what that actually looks like.',
    draft_text: `Most senior candidates under-prepare for interviews. Here's what that actually looks like.

It's not that they don't prepare at all. They do. They read the job spec. They look at the company website. They think about their career story.

What they miss is the specific.

I've sat across from hundreds of senior candidates over the years. The ones who stall — not because they lack the experience, but because they can't reach for a concrete example when it counts.

"Tell me about a time you led through a significant organisational change."

The candidate who prepared knows this is coming. They've picked one story. They know the context, the decision, the outcome, the number. They don't need to search for it in the moment.

The candidate who under-prepared knows they have a good answer somewhere. They just can't find it under pressure.

At senior level, preparation is not a shortcut. It's a signal. It tells the interviewer whether you've taken this process seriously, whether you understand the role, and whether you're the kind of person who shows up ready.

The candidates who get offered the role aren't always the most experienced in the room. They're usually the most prepared.

Three things worth doing before any senior interview:
- Map your top 5 career achievements to likely question themes
- Have one story for each that you can tell in under 3 minutes
- Know the company well enough to ask something specific — not something Google would answer

Preparation isn't extra credit. It's the minimum.

#ExecutiveSearch #InterviewTips #SeniorCandidates #CareerAdvice`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-08',
    channel: 'SL',
    format: 'Post',
    topic: 'Hiring process — candidate experience',
    hook: 'What candidates remember most from a hiring process has nothing to do with the job.',
    draft_text: `What candidates remember most from a hiring process has nothing to do with the job.

Not the role scope. Not the package. Not even whether they got the offer.

What stays with them is how they were treated.

Did someone explain the process clearly at the start? Did they follow up after interviews? Did they get feedback — real feedback, not "we went with someone stronger"?

We've looked at this pattern across hundreds of hiring processes. The companies with the best candidate reputations aren't necessarily the most exciting businesses or the highest payers. They're the ones that communicate consistently and treat people like adults.

The cost of a poor candidate experience isn't always visible. A rejected candidate who had a good experience stays connected to your brand. They refer people. They apply again when the right role opens. They talk about it.

A rejected candidate who felt ignored or disrespected doesn't.

You don't need to transform your entire process. You need to:
- Set expectations at the start (timeline, stages, who they'll meet)
- Follow up after every stage, even with a "we're still deciding"
- Give real feedback to final-round candidates

It's basic. Most companies still don't do it.

#CandidateExperience #Hiring #TalentAcquisition #ExecutiveSearch`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-08',
    channel: 'EFN',
    format: 'Post',
    topic: 'Candidate patterns — preparation signals',
    hook: 'Erica\'s observation: candidates who prepare specific examples get progressed at significantly higher rates.',
    draft_text: `**Erica Field Note — Preparation Signals**

Erica's observation: candidates who prepare specific examples get progressed at significantly higher rates — not because interviewers are grading preparation directly, but because specificity signals competence.

When a candidate answers a behavioural question with a concrete example — named context, clear decision, measurable outcome — the interviewer can evaluate the substance. They have something to work with.

When a candidate answers with a general statement, even a confident one, the interviewer has to guess at the depth behind it. Uncertainty defaults to doubt.

The pattern holds across seniority levels, but becomes more pronounced at Director and above. At that level, interviewers expect leadership under complexity. Vague answers don't just fail to impress — they actively raise questions.

What this means in practice: the gap between progressed and not-progressed candidates is often not experience. It's evidence. Candidates who can reach for a specific example under pressure demonstrate the kind of clarity that hiring teams associate with strong performers.

Preparation is the shortcut to specificity.

*Erica Field Notes are observations from Searchline's hiring intelligence data. They're not opinions — they're patterns.*

#EricaFieldNotes #HiringIntelligence #InterviewData #Searchline`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-09',
    channel: 'SL',
    format: 'Post',
    topic: 'Salary benchmark insight',
    hook: 'Senior sales professionals often don\'t know if their OTE is competitive. Here\'s what the data shows.',
    draft_text: `Senior sales professionals often don't know if their OTE is competitive. Here's what the data shows.

Most people benchmark their salary the same way: they ask a colleague, check a job advert, or rely on what they were told when they joined. None of those are particularly reliable.

Job adverts are aspirational. Colleague data is a sample of one. And what you were told when you joined may be three years out of date.

The reality is that compensation — particularly OTE structures in sales — moves faster than most people track it. A variable split that was market-standard two years ago may now be below what good candidates expect.

When we look at salary data for senior commercial roles, the spread between the bottom and top quartile is consistently wider than people expect. And the professionals who negotiate best are almost always the ones who came in with real data, not a gut feel.

Knowing your market value isn't about demanding more. It's about making an informed decision — whether you're evaluating an offer, having a pay review conversation, or deciding whether to move at all.

Accurate benchmarks matter. Intuition isn't enough.

#SalaryBenchmark #SalesCompensation #CareerIntelligence #Hiring`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-12',
    channel: 'CL',
    format: 'Post',
    topic: 'Executive Search Lessons — what headhunters notice',
    hook: 'After years in exec search, here\'s what separates candidates who get called back from those who don\'t.',
    draft_text: `After years in exec search, here's what separates candidates who get called back from those who don't.

It's rarely experience. At senior level, everyone in the pool has experience. That's table stakes.

What separates people is how easy they make it to see that experience.

Three patterns I've seen consistently:

**The profile that does the work.** Not a list of job titles and responsibilities. A clear story of impact — what was the situation, what changed because they were there, what can be measured. Hiring teams and search firms don't have time to decode a CV. The candidates who surface repeatedly are the ones whose profile answers the question before it's asked.

**The response that signals seriousness.** When a headhunter reaches out, the reply matters. Not just whether you respond, but how. A reply that shows you've read the brief, thought about fit, and can articulate why (or why not) this is relevant to you — that gets remembered. A lazy reply or no reply gets filed.

**The conversation that goes somewhere.** The best candidate conversations are mutual. They come prepared with questions. They've looked at the company, the market, the problem the role is trying to solve. They're not just answering — they're thinking. That shows.

None of this is secret. Most people just don't do it.

#ExecutiveSearch #SeniorCandidates #CareerAdvice #JobSearch`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-12',
    channel: 'SL',
    format: 'Post',
    topic: 'Interview guides — hiring team side',
    hook: 'A good interview process tells a candidate more about your company than your website does.',
    draft_text: `A good interview process tells a candidate more about your company than your website does.

Most companies spend more time crafting their employer brand than they spend designing the interview experience they actually deliver.

The website says: inclusive, collaborative, fast-moving.
The interview says: disorganised, last-minute, no one agrees on what they're looking for.

Candidates notice the gap immediately. And at senior level, they're evaluating you as much as you're evaluating them.

What a structured interview process signals to a strong candidate:

**Clarity** — you know what the role needs and what a good hire looks like. You're not making it up as you go.

**Respect** — you prepared. You showed up on time. You gave them time to ask questions. You followed up.

**Culture** — the way your team conducts an interview is the way your team operates. Candidates draw direct conclusions.

The companies that consistently hire strong senior talent tend to have one thing in common: they take the process as seriously as the candidate does.

It doesn't require a complicated system. It requires agreement on what you're assessing, consistent questions across interviewers, and basic communication at every stage.

Strong candidates have options. The process is part of the offer.

#HiringProcess #InterviewDesign #TalentAcquisition #CandidateExperience`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-13',
    channel: 'EFN',
    format: 'Post',
    topic: 'Hiring team behaviour — bias in shortlisting',
    hook: 'Erica\'s observation: hiring managers shortlist for familiarity more than fit.',
    draft_text: `**Erica Field Note — Shortlisting Bias**

Erica's observation: hiring managers shortlist for familiarity more than fit. The data is uncomfortable.

When reviewing shortlisting decisions across comparable candidate pools, a consistent pattern emerges: candidates from recognisable employers, familiar career trajectories, or educational backgrounds that match the hiring manager's own are disproportionately progressed — even when the objective criteria don't distinguish them from other candidates.

This isn't conscious discrimination. It's pattern matching. The brain responds faster to what it recognises. "I understand this person's background" gets coded as "this person is a strong candidate."

The problem is that familiarity is not a proxy for capability. It's a proxy for similarity.

In practice, this means: candidates with non-linear paths, international experience, or backgrounds outside the hiring manager's network are systematically underscored — not because they're weaker, but because the evaluator has to work harder to see the fit.

What good shortlisting looks like: criteria defined before the process starts, scored against the same standard for every candidate, reviewed by more than one person.

Shortlisting is the highest-leverage moment in a hiring process. The bias that enters here doesn't get corrected downstream.

*Erica Field Notes are observations from Searchline's hiring intelligence data.*

#EricaFieldNotes #HiringBias #Shortlisting #BetterHiring`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-13',
    channel: 'CP',
    format: 'Comment',
    topic: 'Interview prep engagement',
    hook: 'Most people focus on researching the company before a senior interview. The bit that trips people up is having specific examples ready under pressure.',
    draft_text: `"Most people focus on researching the company before a senior interview. The bit that trips people up is having specific examples ready under pressure — not knowing them in theory, but being able to pull one in 30 seconds when the question lands. What's the one area you've found hardest to prepare for?"

*Platform: LinkedIn (relevant interview tips post) or Reddit r/jobs / r/careerguidance*`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-14',
    channel: 'SL',
    format: 'Post',
    topic: 'Candidate career tips — Achievement Record angle',
    hook: 'Most candidates can\'t clearly articulate their top 3 achievements in an interview. Here\'s a simple fix.',
    draft_text: `Most candidates can't clearly articulate their top 3 achievements in an interview. Here's a simple fix.

It's not that they don't have achievements. They do — years of them. The problem is those achievements live scattered across memory, old CVs, performance reviews, and half-remembered conversations.

Under interview pressure, "tell me about your biggest commercial achievement" should take three seconds to answer. For most people, it takes three minutes of searching.

The fix is simple: write them down before you need them.

Not in a CV format. In a format that makes them usable:

- What was the situation?
- What specifically did you do?
- What was the outcome — in numbers, if possible?
- What does this say about how you work?

A candidate with five well-documented achievements, told concisely, is consistently more compelling than a candidate with twenty years of experience they can't reach for quickly.

This matters more at senior level. The expectation isn't just that you've done things — it's that you understand your own impact clearly enough to articulate it.

Most candidates wait until they're job hunting to do this work. The ones who do it as an ongoing habit are always better prepared.

#CareerDevelopment #InterviewPrep #CareerEvidence #SeniorCandidates`,
    risk_status: 'yellow',
    risk_notes: 'Angle is adjacent to the Achievement Record product. No product named. Insight stands alone, but Craig should be aware of the proximity before posting.',
    status: 'drafted',
  },
  {
    date: '2026-05-14',
    channel: 'CL',
    format: 'Post',
    topic: 'AI in Recruitment — practical take',
    hook: 'I\'ve looked at a lot of AI tools in the hiring process. Most of them solve the wrong problem.',
    draft_text: `I've looked at a lot of AI tools in the hiring process. Most of them solve the wrong problem.

The dominant use case right now is speed — screen faster, parse CVs faster, schedule faster. The tools are good at what they do. But speed is not the constraint that breaks most hiring processes.

The constraint is judgment.

Bad hiring decisions happen when the brief isn't clear, when the criteria shift mid-process, when the hiring manager hasn't agreed internally what they're actually looking for, when the assessment is inconsistent across candidates.

None of that is a speed problem. Doing it faster doesn't help.

The AI tools that will matter — the ones worth paying attention to — are the ones focused on improving the quality of decisions, not just the velocity of process. Better structured briefs. Consistent scoring. Surfacing patterns across assessments. Helping hiring teams see what they're actually doing versus what they think they're doing.

That's harder to build. It's also where the real value is.

Automation without better judgment just produces more confident mistakes at scale.

#AIRecruitment #HiringIntelligence #FutureOfWork #ExecutiveSearch`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-15',
    channel: 'CL',
    format: 'Post',
    topic: 'Candidate Visibility — LinkedIn presence',
    hook: 'Your LinkedIn profile is the first interview you don\'t know you\'re having.',
    draft_text: `Your LinkedIn profile is the first interview you don't know you're having.

Before you've responded to a message, before you've applied for anything, someone has already formed an opinion.

A headhunter is working a brief. They search. They find five or six people with roughly the right experience. Two of those profiles are good enough to understand quickly. The others require work to decode.

The two that are clear get the call.

This happens hundreds of times a day across every sector. Most senior professionals have no idea their profile is actively filtering them in or out of conversations they don't even know are happening.

What a visible profile looks like — at senior level:

It answers the question before it's asked. What have you done, at what scale, with what results? Not a list of responsibilities. Evidence of impact.

It's written for someone who doesn't know your employer. Not everyone knows what your company does or how big it is. Context helps.

It has enough specific detail to give a reader confidence you're the right fit to reach out to.

You don't need to post constantly. You don't need to be an influencer. You just need a profile that works when someone's looking.

Most don't.

#LinkedInProfile #ExecutiveSearch #CandidateVisibility #CareerDevelopment`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-15',
    channel: 'SL',
    format: 'Post',
    topic: 'Hiring scorecards — consistent decisions',
    hook: 'Most hiring teams make decisions differently. A simple scorecard fixes that.',
    draft_text: `Most hiring teams make decisions differently. A simple scorecard fixes that.

Four interviewers go into a hiring process for the same role. Each one is assessing something different. One is focused on culture fit. One is testing technical depth. One is running their own agenda. One is just having a conversation.

They come out of the process with different conclusions — and then have to reconcile them in a debrief that turns into negotiation.

This isn't unusual. It's the default state of most unstructured hiring processes.

The fix is straightforward: define what you're actually assessing before the first interview.

A basic scorecard does three things:
1. Names the 4–6 criteria that matter for this specific role
2. Defines what strong, acceptable, and weak looks like for each
3. Gets every interviewer scoring against the same standard

It doesn't take long to build. It takes discipline to use consistently.

When you debrief with a scorecard, you're comparing apples with apples. Disagreements become useful — they reveal where criteria need clarifying, not just where opinions differ.

The companies that hire well tend to be intentional about what they're looking for — before the process starts, not during it.

#HiringProcess #InterviewScorecard #TalentAcquisition #BetterHiring`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-16',
    channel: 'EFN',
    format: 'Post',
    topic: 'Salary data — OTE reality vs expectation',
    hook: 'Erica\'s observation: candidates consistently overestimate their OTE versus market rate.',
    draft_text: `**Erica Field Note — OTE Reality Gap**

Erica's observation: candidates consistently overestimate their OTE versus market rate — until they see the benchmark. The gap is larger than most expect.

Across senior commercial roles, a clear pattern emerges in salary conversations: candidates enter negotiations with a figure in mind that is frequently above the market median for their profile. Not dramatically — but enough to create friction that delays or derails offers.

This isn't overconfidence. It's information asymmetry. Most professionals benchmark their OTE against their current package, their last offer, or anecdotal peer data. All of those are unreliable data points when the market has moved.

The variables that actually drive OTE at senior level:
- Sector and vertical (not just "tech" or "sales")
- Company stage and revenue bracket
- Scope of role and team size
- Geography and remote-work premium/discount

When candidates see a benchmark that reflects all of these variables, their calibration adjusts — and the negotiation becomes more productive for both sides.

Better salary data produces better hiring outcomes. The information gap isn't serving anyone.

*Erica Field Notes are observations from Searchline's hiring intelligence data.*

#EricaFieldNotes #SalaryBenchmark #OTE #HiringIntelligence`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-16',
    channel: 'SL',
    format: 'Post',
    topic: 'Hiring intelligence — passive candidates',
    hook: 'The best candidates for your role aren\'t looking. Here\'s how to reach them anyway.',
    draft_text: `The best candidates for your role aren't looking. Here's how to reach them anyway.

This is one of the most consistent findings in senior hiring: the strongest candidate for a given role is almost never actively on the market when you start looking.

They're in a job. They're not monitoring job boards. They haven't updated their CV. They're not responding to every recruiter who messages them on LinkedIn.

Which means the standard "post and pray" approach misses them entirely.

Reaching passive candidates requires a different approach:

**A sharp brief.** Not a job description. A clear articulation of why this role is an interesting move — market position, team quality, the problem to be solved. Passive candidates aren't looking for a job, they're looking for a reason to consider one.

**Direct, relevant outreach.** Generic InMails get ignored. Outreach that demonstrates you've looked at their background and can articulate why the fit is worth a conversation gets responses.

**Patience with the process.** Passive candidates move at their own speed. They'll ask better questions, take longer to get comfortable, and withdraw if the process is disorganised. The process has to be worth their time.

The best talent is always passively available. The question is whether you're in a position to reach it.

#ExecutiveSearch #PassiveCandidates #TalentAcquisition #Hiring`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-19',
    channel: 'CL',
    format: 'Post',
    topic: 'Interview tips — questions to ask',
    hook: 'The questions you ask in an interview say more about you than your answers do.',
    draft_text: `The questions you ask in an interview say more about you than your answers do.

Most candidates spend their preparation time working on answers. Reasonably — that's most of the interview.

But the Q&A at the end is where senior candidates distinguish themselves, and most people waste it.

The default questions are predictable: "What does success look like in this role?" "What are the biggest challenges?" "What's the culture like?" They're fine. They're not memorable.

The questions that land are the ones that demonstrate you've actually thought about the role, the business, the problem they're trying to solve.

"I noticed your last two hires at this level came from [sector]. Is that intentional, or is that the market you've been fishing in?"

"You mentioned the team is going through a restructure. How does that affect the scope of this role in the first six months?"

"What's the hardest part of this role that you're finding difficult to communicate in the job spec?"

Questions like these signal preparation, commercial awareness, and genuine curiosity. They also change the energy of the conversation — it becomes more mutual.

The interviewer remembers the candidate who made them think.

#InterviewTips #ExecutiveSearch #CareerAdvice #SeniorCandidates`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-19',
    channel: 'SL',
    format: 'Post',
    topic: 'Candidate experience — feedback culture',
    hook: 'Most companies say they give candidate feedback. Almost none of them actually do.',
    draft_text: `Most companies say they give candidate feedback. Almost none of them actually do.

Ask almost any HR team whether they give feedback to unsuccessful candidates and the answer is yes. Ask the candidates themselves and the answer is almost universally: "We went with someone who was a stronger fit for the role right now."

That's not feedback. That's a refusal dressed up as a sentence.

Real feedback is specific. It tells a candidate what they demonstrated well, what they didn't, and where the gap was between them and the person who progressed. It's usable — a candidate can do something with it.

The reasons companies avoid real feedback are understandable: legal risk, time, the awkwardness of delivering bad news. But the cost is real.

Candidates who receive genuine feedback — even when it's not what they wanted to hear — come away with a better impression of the company than those who receive nothing or platitudes. They refer people. They reapply when the circumstances change. They don't leave bad reviews.

The calculation is straightforward: the effort required to give meaningful feedback is low. The cost of not giving it, over time, is measurable.

Final-round candidates especially deserve the real answer.

#CandidateFeedback #CandidateExperience #Hiring #TalentAcquisition`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-20',
    channel: 'EFN',
    format: 'Post',
    topic: 'Career evidence — interview gaps',
    hook: 'Erica\'s observation: 8 in 10 candidates struggle to evidence impact with numbers.',
    draft_text: `**Erica Field Note — Career Evidence Gap**

Erica's observation: 8 in 10 candidates struggle to evidence impact with numbers. Most have the data — they just haven't documented it.

In assessments of senior candidate interview performance, a consistent pattern emerges around achievement articulation. When asked to describe their most significant career impacts, the majority of candidates can describe what they did — but struggle to quantify it.

"I led the sales team through a period of significant growth."
vs.
"I took the team from £4m to £11m ARR over 18 months, with headcount flat."

Both candidates may have done exactly the same thing. The second one lands differently — not because the achievement is bigger, but because it's evidenced.

The underlying cause is rarely that the data doesn't exist. It does — in performance reviews, board reports, team updates, CRM dashboards. The problem is that most professionals don't maintain a running record of their own impact. When they need it, they have to reconstruct it under pressure.

Candidates who keep an ongoing record of their achievements are consistently better placed in interviews and compensation negotiations.

The evidence exists. It just needs to be captured before you need it.

*Erica Field Notes are observations from Searchline's hiring intelligence data.*

#EricaFieldNotes #CareerEvidence #InterviewData #HiringIntelligence`,
    risk_status: 'yellow',
    risk_notes: 'Same territory as Post 9 (Achievement Record adjacent). Two posts on same angle — confirm both are fine. Could swap for a different topic if you want to reduce proximity to the product.',
    status: 'drafted',
  },
  {
    date: '2026-05-20',
    channel: 'SL',
    format: 'Post',
    topic: 'Executive search vs in-house hiring',
    hook: 'Executive search exists because standard hiring processes were built for volume, not quality.',
    draft_text: `Executive search exists because standard hiring processes were built for volume, not quality.

Job boards, applicant tracking systems, automated screening — all of it was designed to handle scale. To process hundreds of applications efficiently. To get to a shortlist quickly.

That works for roles where the talent pool is broad and the stakes of a hire are low.

It doesn't work for senior hires, where the best candidate is almost never in the active applicant pool, where the cost of a wrong decision is significant, and where the margin of difference between a good hire and a great one is measurable for years.

Executive search fills a specific gap: identifying and approaching candidates who aren't looking, assessing them against a brief that goes beyond a job description, and managing a process that treats senior professionals as senior professionals.

The mistake companies make is applying a volume-hiring process to a quality-hiring problem. The tools are wrong for the job.

Senior hiring isn't a pipeline problem. It's a judgment problem. The process has to match.

#ExecutiveSearch #SeniorHiring #TalentStrategy #Hiring`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-21',
    channel: 'CP',
    format: 'Comment',
    topic: 'Community — salary transparency',
    hook: 'The hardest part of salary negotiation at senior level is usually not knowing whether your current package is actually market rate or just what the last person asked for.',
    draft_text: `"The hardest part of salary negotiation at senior level is usually not knowing whether your current package is actually market rate or just what the last person asked for. Most people don't have good data — they have one or two data points from colleagues or job adverts. Have you found a reliable way to benchmark?"

*Platform: LinkedIn (salary/negotiation threads) or Reddit r/jobs / r/personalfinance*`,
    risk_status: 'green',
    risk_notes: null,
    status: 'drafted',
  },
  {
    date: '2026-05-21',
    channel: 'SL',
    format: 'Post',
    topic: 'Candidate Portal angle — career profiles',
    hook: 'What if the right candidate already exists, and it\'s just a matching problem?',
    draft_text: `What if the right candidate already exists, and it's just a matching problem?

Most hiring processes are designed around sourcing — find candidates, screen them, assess them. The assumption is that the search starts from scratch every time.

But the talent market doesn't reset between roles. The strong candidates who weren't quite right for the last role are still there. The people who were interested but the timing was wrong haven't gone anywhere. The professionals with the exact background you need didn't disappear because you closed the last requisition.

The problem isn't that the right candidate doesn't exist. It's that the hiring process has no memory.

When candidate data is captured and maintained properly — not just as an ATS entry, but as a living profile that reflects actual experience and career trajectory — the search for the next hire becomes a matching problem, not a sourcing problem.

The shift from "find new candidates" to "activate the right ones" changes the economics of hiring significantly. Faster, less expensive, higher quality — because you're working with signal, not noise.

The infrastructure for this kind of hiring intelligence exists. Most companies aren't using it yet.

#HiringIntelligence #TalentStrategy #CandidateManagement #ExecutiveSearch`,
    risk_status: 'yellow',
    risk_notes: 'Clearly positions Candidate Portal (which is live/beta). No product named. But the framing is close to product positioning. Confirm Day 31 timing applies before scheduling.',
    status: 'drafted',
  },
]

async function seed() {
  console.log(`Seeding ${posts.length} radar posts...`)

  const res = await fetch(`${SUPABASE_URL}/rest/v1/radar_posts`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(posts),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Seed failed:', res.status, err)
    process.exit(1)
  }

  const data = await res.json()
  console.log(`✅ Seeded ${data.length} posts successfully!`)
}

seed().catch((e) => { console.error(e); process.exit(1) })
