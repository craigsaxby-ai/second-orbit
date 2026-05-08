import { Link } from 'react-router-dom'

function Nav() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 32px', borderBottom: '1px solid #1e293b',
      background: '#020617', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <img src="/second-orbit-logo.svg" alt="Second Orbit" style={{ height: 32, width: 'auto' }} />
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          { to: '/', label: 'Home' },
          { to: '/tasks', label: 'Tasks' },
          { to: '/automation', label: '⚙️ Automation' },
          { to: '/ai-framework', label: '🧠 AI Framework' },
          { to: '/marketing-strategy', label: '📣 Marketing', active: true },
        ].map(({ to, label, active }) => (
          <Link key={to} to={to} style={{
            color: active ? '#f8fafc' : '#94a3b8',
            textDecoration: 'none', fontSize: 14,
            fontWeight: active ? 600 : 500,
          }}>{label}</Link>
        ))}
      </div>
    </nav>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{
        color: '#f8fafc', fontSize: 13, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 16, paddingBottom: 10,
        borderBottom: '1px solid #1e293b',
      }}>{title}</h2>
      {children}
    </section>
  )
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: '#0f172a',
      border: `1px solid #1e293b`,
      borderLeft: accent ? `3px solid ${accent}` : undefined,
      borderRadius: accent ? '0 10px 10px 0' : 10,
      padding: '20px 24px',
      marginBottom: 12,
    }}>{children}</div>
  )
}

function Tag({ children, color = '#f97316' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 9999,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
      marginRight: 6,
      marginBottom: 6,
    }}>{children}</span>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ color: '#f97316', fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '0 0 10px' }}>{children}</p>
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '8px 0', padding: '0 0 0 18px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7 }}>{item}</li>
      ))}
    </ul>
  )
}

export default function MarketingStrategy() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: 'system-ui, sans-serif' }}>
      <Nav />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ width: 48, height: 3, background: '#f97316', borderRadius: 2, marginBottom: 24 }} />
          <h1 style={{ color: '#f8fafc', fontSize: 30, fontWeight: 800, margin: '0 0 12px' }}>
            📣 Marketing Strategy
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            Second Orbit · 90-Day Plan · Confidential
          </p>
        </div>

        {/* Context */}
        <Section title="Context">
          <Card accent="#f97316">
            <P>Solo founder running everything via OpenClaw. Time-poor (full-time job). English and writing not a strong point. 20,000 LinkedIn connections but not posting. Must stay faceless - cannot be seen to have another business yet.</P>
            <P>Mission: finish Searchline MVP → get free users → prove traction → move to paid model.</P>
          </Card>
        </Section>

        {/* Core Strategy */}
        <Section title="1 · Core Strategy">
          <Card>
            <P>Build a <strong style={{ color: '#f8fafc' }}>faceless talent intelligence ecosystem</strong> around senior B2B sales hiring and careers.</P>
            <P><strong style={{ color: '#f8fafc' }}>Public positioning:</strong> Free tools, benchmarks, and practical AI resources - help senior sales leaders make better career moves and help hiring teams hire smarter.</P>
            <P><strong style={{ color: '#f97316' }}>Lead with free value first. Not the product.</strong></P>
            <div style={{ marginTop: 12, padding: '12px 16px', background: '#020617', borderRadius: 8 }}>
              <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Product Flow</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                {['Salary Benchmark', '→', 'Candidate Portal', '→', 'Achievement Record', '→', 'Searchline Pilots', '→', 'Paid Searchline'].map((s, i) => (
                  <span key={i} style={{ color: s === '→' ? '#475569' : '#f97316', fontSize: 13, fontWeight: s === '→' ? 400 : 600 }}>{s}</span>
                ))}
              </div>
            </div>
          </Card>
        </Section>

        {/* Brand Structure */}
        <Section title="2 · Brand Structure">
          {[
            {
              name: 'Second Orbit', color: '#a78bfa',
              use: ['AI product studio narrative', 'Lab notes', 'Operating system content', 'Longer-term credibility'],
              note: 'Sits behind the products. Not the main marketing engine yet.',
            },
            {
              name: 'Searchline', color: '#f97316',
              use: ['Salary Benchmark content', 'Senior sales hiring content', 'Erica Field Notes', 'Employer pilot invitations', 'Product education'],
              note: 'Main LinkedIn company page and public growth engine.',
            },
            {
              name: 'Erica', color: '#60a5fa',
              use: ['Candidate-friendly tips', 'Salary benchmark prompts', 'Career evidence advice', '"Erica Field Notes" posts'],
              note: 'Product voice/persona - not a fake person. No fake LinkedIn profile.',
            },
            {
              name: "Craig's LinkedIn", color: '#34d399',
              use: ['AI in hiring', 'Candidate experience', 'Salary transparency', 'Career evidence', 'Better hiring workflows'],
              note: 'Stay broad, safe and neutral. Never "I built Searchline" or "Book a demo."',
            },
          ].map(({ name, color, use, note }) => (
            <Card key={name} accent={color}>
              <H3>{name}</H3>
              <div style={{ marginBottom: 8 }}>{use.map(u => <Tag key={u} color={color}>{u}</Tag>)}</div>
              <P>{note}</P>
            </Card>
          ))}
        </Section>

        {/* LinkedIn */}
        <Section title="3 · LinkedIn Setup">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Card>
              <H3>Personal (Craig)</H3>
              <P><strong style={{ color: '#f8fafc' }}>Cadence:</strong> 1 post/week max</P>
              <P><strong style={{ color: '#f8fafc' }}>Tone:</strong> Thoughtful, neutral, non-promotional</P>
              <Bullets items={['Better hiring processes', 'AI in recruitment', 'Career evidence', 'Salary transparency']} />
            </Card>
            <Card>
              <H3>Searchline Company Page</H3>
              <P><strong style={{ color: '#f8fafc' }}>Cadence:</strong> 3-5 posts/week</P>
              <P><strong style={{ color: '#f8fafc' }}>Purpose:</strong> Main growth engine</P>
              <Bullets items={['Salary insights', 'Hiring scorecards', 'Erica Field Notes', 'Pilot invitations']} />
            </Card>
          </div>
          <Card accent="#ef4444">
            <H3>Setup Rules</H3>
            <Bullets items={[
              'Create a Company Page, not a fake personal profile',
              'Use Craig\'s real account as private admin only',
              'Do not add Searchline to Craig\'s public Experience section yet',
              'Add 5-10 starter posts before pushing traffic',
            ]} />
          </Card>
        </Section>

        {/* Channels */}
        <Section title="4 · Main Channels">
          {[
            { priority: '🔴 Highest', name: 'LinkedIn Company Pages', why: 'Employer credibility, candidate trust, thought leadership, tool promotion, pilot invitations.' },
            { priority: '🟠 High', name: 'Apollo.io', why: 'Direct employer pilot engine. Carefully targeted campaigns. 100 prospects → 30 replies → 10 conversations → 3 pilots.' },
            { priority: '🟡 Long-term', name: 'SEO / AEO', why: 'Compounding channel. Target: VP Sales salary benchmark, CRO OTE ranges, "how to hire a VP Sales", career evidence guides.' },
            { priority: '🟢 Support', name: 'Communities', why: 'RevGenius, Pavilion, Reddit r/sales, r/recruiting, r/SaaS. Value-first only - no spam, no repeated links.' },
            { priority: '🔵 Experiment', name: 'TikTok / Instagram Reels', why: 'Candidate-side only. Faceless screen recordings. Run 14-day test (20 videos). If no signups, pause.' },
          ].map(({ priority, name, why }) => (
            <Card key={name}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap', paddingTop: 1 }}>{priority}</span>
                <div>
                  <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{name}</div>
                  <P>{why}</P>
                </div>
              </div>
            </Card>
          ))}
        </Section>

        {/* Apollo Campaigns */}
        <Section title="5 · Apollo Campaign Structure">
          {[
            {
              name: 'Campaign 1: Founder / CEO Hiring First Sales Leader',
              target: ['B2B SaaS 20-300 employees', 'UK / Europe / US', 'Hiring VP Sales, CRO, Sales Director', 'Recent funding or growth signal'],
              offer: 'Free private AI hiring pilot',
              angle: 'We are testing an AI-assisted way to turn a 20-minute role brief into a screened, ranked shortlist.',
            },
            {
              name: 'Campaign 2: Talent / People Leaders',
              target: ['Head of Talent', 'People Director', 'Talent Acquisition Lead', 'Companies hiring commercial leadership'],
              offer: 'Free VP Sales hiring scorecard + optional Searchline pilot',
              angle: '',
            },
            {
              name: 'Campaign 3: Fractional CROs / GTM Advisors',
              target: ['Fractional CROs', 'Revenue consultants', 'GTM advisors', 'SaaS growth advisors'],
              offer: 'Searchline as a free tool for portfolio/client companies',
              angle: 'Strong referral channel potential.',
            },
          ].map(({ name, target, offer, angle }) => (
            <Card key={name} accent="#60a5fa">
              <H3>{name}</H3>
              <div style={{ marginBottom: 8 }}>{target.map(t => <Tag key={t} color="#60a5fa">{t}</Tag>)}</div>
              <P><strong style={{ color: '#f8fafc' }}>Offer:</strong> {offer}</P>
              {angle && <P>{angle}</P>}
            </Card>
          ))}
        </Section>

        {/* Content System */}
        <Section title="6 · Content System">
          <Card accent="#f97316">
            <H3>One Idea → Many Formats</H3>
            <P>Use one core idea per week and repurpose into every channel.</P>
            <P><strong style={{ color: '#f8fafc' }}>Example core idea:</strong> "Why VP Sales hiring goes wrong"</P>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 8 }}>
              {['Craig LinkedIn', 'Searchline post', 'Reddit discussion', 'SEO article', 'Email newsletter', 'Apollo hook', 'TikTok script', 'Carousel', 'Comments'].map(f => (
                <Tag key={f}>{f}</Tag>
              ))}
            </div>
          </Card>
        </Section>

        {/* Content Pillars */}
        <Section title="7 · Content Pillars">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { title: 'Salary & Market Intelligence', items: ['VP Sales salary benchmarks', 'CRO OTE ranges', 'UK vs Europe vs GCC', 'Base vs OTE vs equity'] },
              { title: 'Hiring Better Sales Leaders', items: ['Why VP Sales hires fail', 'First sales leader guide', 'Sales leadership scorecards', 'CRO interview questions'] },
              { title: 'Candidate Career Evidence', items: ['How to evidence quota', 'Stronger CV bullets', 'Track weekly wins', 'Annual review prep'] },
              { title: 'AI in Hiring', items: ['What AI should/shouldn\'t do', 'Async pre-screening', 'Better role briefing', 'AI supports human judgement'] },
            ].map(({ title, items }) => (
              <Card key={title}>
                <H3>{title}</H3>
                <Bullets items={items} />
              </Card>
            ))}
          </div>
        </Section>

        {/* SEO & AEO Strategy */}
        <Section title="8 · SEO & AEO Strategy">
          <Card accent="#7c3aed">
            <H3>Positioning Anchor</H3>
            <P>Searchline is not a job board, not an ATS, not traditional executive search software. It is the <strong style={{ color: '#f8fafc' }}>technology layer that automates recruitment workflows using AI agents</strong>. Current niche: tech sales leader hiring. Expanding to: all AI-driven recruitment automation. We are the technology provider - not the recruiter.</P>
            <P>This distinction matters for every keyword and content decision we make.</P>
          </Card>

          <Card accent="#a78bfa">
            <H3>AEO First - Why This Is The Right Bet Right Now</H3>
            <P>ChatGPT, Perplexity, and Claude are being asked questions like <em style={{ color: '#cbd5e1' }}>"what's the best AI tool for screening candidates"</em>, <em style={{ color: '#cbd5e1' }}>"how do I automate my hiring workflow"</em>, <em style={{ color: '#cbd5e1' }}>"what is an AI recruitment agent"</em>. The answers come from well-structured, authoritative content that answers those specific questions clearly.</P>
            <P>Almost no purpose-built pages target this yet. With 5-6 good articles we can own those answers in AI answer engines inside 60-90 days. That would take years of traditional SEO work to achieve the same visibility in Google.</P>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginTop: 10 }}>
              {[
                { label: 'Speed to visibility', value: '60-90 days (AEO) vs 12-18 months (SEO)' },
                { label: 'Competition level', value: 'Very low right now - window is open' },
                { label: 'Traffic source', value: 'Growing fast - AI answer engines overtaking Google for research queries' },
                { label: 'Content requirement', value: 'Well-structured Q&A format, clear definitions, real examples' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#0a0f1e', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                  <div style={{ color: '#e2e8f0', fontSize: 13 }}>{value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card accent="#22c55e">
            <H3>Keyword Strategy - Target vs Avoid</H3>
            <P>Don't compete on generic HR/recruitment terms. DA90 players are spending six figures on them. Pick angles that are growing fast, have genuine intent, and have almost no purpose-built content yet.</P>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
              <div>
                <div style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>✓ Target These</div>
                {[
                  'AI recruitment agent',
                  'automated hiring workflow',
                  'AI candidate screening',
                  'tech sales hiring automation',
                  'how to automate recruitment with AI',
                  'AI interview agent',
                  'recruitment automation software',
                  'automated candidate pre-screening',
                ].map(kw => (
                  <div key={kw} style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '5px 10px', marginBottom: 5, color: '#86efac', fontSize: 13 }}>{kw}</div>
                ))}
              </div>
              <div>
                <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>✗ Avoid These (Too Competitive)</div>
                {[
                  'recruitment software',
                  'applicant tracking system',
                  'executive search',
                  'HR software',
                  'recruitment platform',
                  'talent acquisition',
                  'hiring software',
                  'ATS',
                ].map(kw => (
                  <div key={kw} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, padding: '5px 10px', marginBottom: 5, color: '#fca5a5', fontSize: 13 }}>{kw}</div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12 }}><P>When a keyword is too competitive, find a more specific angle with the same intent. e.g. "recruitment software" → "AI recruitment agent for tech sales hiring".</P></div>
          </Card>

          <Card accent="#f97316">
            <H3>Article Content Plan - AEO-Structured</H3>
            <P>Each article targets one primary keyword and is structured to be cited by AI answer engines. Format: clear definition, how it works, who uses it, benefits, real example. No fluff.</P>
            {[
              { title: 'What is an AI recruitment agent - and how does it work?', keyword: 'AI recruitment agent', aeo: 'What is an AI recruitment agent?', status: 'In progress' },
              { title: 'How to build an automated recruitment workflow with AI', keyword: 'automated recruitment workflow', aeo: 'How do I automate my hiring process?', status: 'In progress' },
              { title: "AI candidate screening: how it works and why it's replacing manual CV review", keyword: 'AI candidate screening', aeo: 'How does AI candidate screening work?', status: 'In progress' },
            ].map(({ title, keyword, aeo, status }) => (
              <div key={title} style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{title}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Tag color="#f97316">{keyword}</Tag>
                  <Tag color="#a78bfa">AEO: {aeo}</Tag>
                  <Tag color="#22c55e">{status}</Tag>
                </div>
              </div>
            ))}
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            <Card accent="#60a5fa">
              <H3>Backlink Strategy</H3>
              <P><strong style={{ color: '#93c5fd' }}>Now - organic only.</strong> Don't chase backlinks early. Let good content do the work.</P>
              <Bullets items={[
                "Submit to AI tool directories (Futurepedia, There's An AI For That)",
                'G2 / Capterra listings (free tier)',
                'Product Hunt launch when ready',
                'Reddit + community mentions through genuine participation',
                'HR tech blogs will cite good content naturally',
              ]} />
              <P><strong style={{ color: '#93c5fd' }}>When budget allows:</strong> Guest posts on SHRM, ERE, RecruitingBriefings (~£500-1,500 each, high DA). Partner content with ATSs.</P>
            </Card>

            <Card accent="#fbbf24">
              <H3>Paid Search - Not Yet</H3>
              <P>Don&apos;t bid on keywords before you have conversion data. &quot;AI hiring&quot; keywords run £10–30 CPC. Without knowing what converts, that&apos;s burning money.</P>
              <P><strong style={{ color: '#fde68a' }}>The trigger:</strong> Run 90 days of organic content. Track which keywords drive signups or demo requests. Then bid narrowly on exactly those terms with a tight budget.</P>
              <Bullets items={[
                'Month 1-3: organic only',
                'Month 4+: retarget visitors only (cheap, high intent)',
                'Month 6+: narrow keyword bidding if conversion data supports it',
              ]} />
            </Card>
          </div>

          <Card accent="#94a3b8">
            <H3>Decision Framework - How We Choose Keywords Over Time</H3>
            <P>The strategy will evolve as we see what drives signups. But the framework is locked:</P>
            {[
              { q: 'High competition keyword?', a: 'Find a more specific angle with the same intent. Own the niche version first.' },
              { q: 'High search volume but expensive?', a: "Write AEO content for it, don't bid. Wait for domain authority to build." },
              { q: 'Low volume but perfect intent?', a: 'Write it. One signup from a perfect-fit customer beats 1,000 bounces.' },
              { q: 'Trending topic?', a: 'Fast-publish a short AEO page. Speed matters for AI answer engine indexing.' },
            ].map(({ q, a }) => (
              <div key={q} style={{ display: 'flex', gap: 12, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #1e293b' }}>
                <div style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600, minWidth: 200, flexShrink: 0 }}>{q}</div>
                <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </Card>
        </Section>

        {/* Risk Rules */}
        <Section title="9 · Risk Rules">
          <Card accent="#ef4444">
            <P>Before publishing, check every piece of content:</P>
            <Bullets items={[
              'Does this look like Craig is running a competing recruitment business?',
              'Does it mention or imply Craig\'s employer?',
              'Does it use confidential market knowledge?',
              'Does it directly sell Searchline from Craig\'s personal profile?',
              'Could someone reasonably ask, "Why is Craig pushing this?"',
            ]} />
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '8px 0 0' }}><strong style={{ color: '#ef4444' }}>If yes → publish from Searchline or do not publish.</strong></p>
          </Card>
        </Section>

        {/* Radar */}
        <Section title="10 · Radar - Marketing OS">
          <P>Separate Telegram channel: <strong style={{ color: '#f8fafc' }}>Radar</strong>. Marketing and growth command centre. Keeps content work away from Nova to avoid burning Sonnet tokens.</P>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { name: 'Radar Prime', model: 'Gemini Pro', color: '#a78bfa', use: ['Marketing strategy', 'Competitor research', 'Positioning', 'Campaign ideas', 'Trend analysis'] },
              { name: 'Radar Ops', model: 'Gemini Flash', color: '#34d399', use: ['First drafts', 'Content repurposing', 'Captions', 'Apollo emails', 'SEO outlines', 'Post variations'] },
              { name: 'Nova Radar Review', model: 'Sonnet only', color: '#f97316', use: ['High-judgement review', 'Brand positioning', 'GTM strategy', 'Reputation risk'] },
              { name: 'ANT', model: 'GPT-5.1 Codex', color: '#60a5fa', use: ['Landing pages', 'Email flows', 'Lead forms', 'Analytics', 'Blog pages'] },
            ].map(({ name, model, color, use }) => (
              <Card key={name} accent={color}>
                <H3>{name}</H3>
                <div style={{ marginBottom: 8 }}><Tag color={color}>{model}</Tag></div>
                <Bullets items={use} />
              </Card>
            ))}
          </div>
        </Section>

        {/* Weekly Rhythm */}
        <Section title="11 · Weekly Operating Rhythm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { day: 'Mon', label: 'Research', detail: 'Radar Ops scans LinkedIn, Reddit, communities. Output: 10 content ideas, 5 community questions, 3 SEO ideas, 1 weekly insight.' },
              { day: 'Tue', label: 'Draft', detail: '3 LinkedIn posts, 1 Searchline post, 1 Reddit post, 1 email, 1 SEO outline, 1 Apollo hook, 3 short comments.' },
              { day: 'Wed', label: 'Review', detail: 'Nova reviews only high-risk posts, major positioning, Apollo campaigns, reputation-sensitive content.' },
              { day: 'Thu', label: 'Publish / Schedule', detail: 'Radar prepares content calendar. Craig approves.' },
              { day: 'Fri', label: 'Measure', detail: 'Radar reports: visits, signups, email captures, best post, best channel, Apollo replies, cost, next experiment.' },
            ].map(({ day, label, detail }) => (
              <div key={day} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f97316', color: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{day}</div>
                <div>
                  <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{label}</div>
                  <P>{detail}</P>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 90 Day Plan */}
        <Section title="14 · 90-Day Action Plan">
          {[
            { phase: 'Days 1-14', title: 'Foundation', color: '#f97316', goal: '30-50 Salary Benchmark users. First emails captured. Radar operational.', actions: ['Searchline LinkedIn Company Page', 'Second Orbit LinkedIn (light)', '5-10 starter Searchline posts', 'Email capture across all products', 'Resend email flows + PostHog tracking', 'Radar Telegram channel setup', 'First Apollo target list', 'Salary benchmark email sequence'] },
            { phase: 'Days 15-45', title: 'Candidate Growth', color: '#60a5fa', goal: '100 Salary Benchmark users. 50+ Candidate Portal profiles. 30+ Achievement Record users. First employer replies.', actions: ['Publish consistently from Searchline', 'Safe weekly content from Craig', 'Value-first community posts', 'Test 10-20 TikTok/Reels', 'Push Salary Benchmark → Candidate Portal', 'Push Candidate Portal → Achievement Record', 'Light Apollo outreach (10-20 pilot invites)'] },
            { phase: 'Days 46-75', title: 'Employer Pilots', color: '#a78bfa', goal: '5-10 employer conversations. 3+ live pilots. 100+ candidate interactions. First proof points.', actions: ['Apollo list of 100 target companies', 'Targeted Apollo sequences', 'VP Sales scorecard published', 'Invite 10 companies into private pilots', 'Collect feedback', 'Track all candidate interactions'] },
            { phase: 'Days 76-90', title: 'Proof & Momentum', color: '#34d399', goal: '100+ candidate users. 3-5 employer pilots. First paid signals. Clear proof for scaling.', actions: ['Anonymised case studies', '"What we learned from 100 senior sales profiles"', 'Benchmark report', 'Searchline pilot application page', 'Test first paid offer', 'Decide which channel to double down on'] },
          ].map(({ phase, title, color, goal, actions }) => (
            <Card key={phase} accent={color}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Tag color={color}>{phase}</Tag>
                <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15 }}>{title}</span>
              </div>
              <Bullets items={actions} />
              <div style={{ marginTop: 12, padding: '8px 12px', background: `${color}15`, borderRadius: 6, color, fontSize: 13, fontWeight: 600 }}>🎯 Goal: {goal}</div>
            </Card>
          ))}
        </Section>

        {/* Strongest Recommendation */}
        <Section title="16 · Strongest Recommendation">
          <div style={{ background: '#1c0a00', border: '1px solid #7c2d12', borderRadius: 12, padding: '28px' }}>
            <div style={{ color: '#fb923c', fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Start with the Salary Benchmark Tool 🎯</div>
            <P>First campaign: <strong style={{ color: '#f8fafc' }}>"Are senior sales leaders being paid fairly in 2026?"</strong></P>
            <div style={{ marginBottom: 12 }}>{['Useful', 'Free', 'Anonymous', 'Safe', 'Candidate-led', 'Shareable', 'Directly connected to Searchline'].map(t => <Tag key={t}>{t}</Tag>)}</div>
            <div style={{ padding: '14px 16px', background: '#020617', borderRadius: 8, marginTop: 12 }}>
              <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Full System</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                {['Salary Benchmark', '→', 'Candidate Portal', '→', 'Achievement Record', '→', 'Candidate DB', '→', 'Employer Pilots', '→', 'Case Studies', '→', 'Paid Searchline'].map((s, i) => (
                  <span key={i} style={{ color: s === '→' ? '#475569' : '#f97316', fontSize: 13, fontWeight: s === '→' ? 400 : 600 }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>

      </main>
    </div>
  )
}
