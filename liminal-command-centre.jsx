import { useState, useEffect, useCallback } from "react";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  night: "#0F1F2E",
  gold: "#C8B89A",
  parchment: "#F5F0E6",
  white: "#FFFFFF",
  nightMid: "#1a2f42",
  nightLight: "#243548",
  goldDim: "#a89878",
  green: "#4CAF7D",
  amber: "#E8A838",
  red: "#E05C5C",
  muted: "#8A9AAA",
};

// ── Mark SVG ─────────────────────────────────────────────────────────────────
const Mark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <defs>
      <filter id="glow-mark" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={C.gold} floodOpacity="0.5" />
      </filter>
    </defs>
    <g filter="url(#glow-mark)">
      <line x1="6" y1="46" x2="44" y2="6" stroke={C.white} strokeWidth="2.2" />
      <line x1="6" y1="46" x2="48" y2="24" stroke={C.white} strokeWidth="1.4" opacity="0.45" />
      <line x1="6" y1="46" x2="42" y2="36" stroke={C.white} strokeWidth="0.85" opacity="0.22" />
      <circle cx="6" cy="46" r="3" fill={C.gold} />
    </g>
  </svg>
);

// ── Pipeline data ─────────────────────────────────────────────────────────────
const PIPELINE_DEFAULT = [
  { id: 1, client: "Wink", type: "Retainer", status: "active", rate: "$80/hr", weekly: "8–12 hrs", priority: "medium", notes: "Ongoing copywriting", invoiced: 0, target: 0 },
  { id: 2, client: "Louise Cummins", type: "Project", status: "active-high", rate: "$14,000", weekly: "—", priority: "high", notes: "Conceptual edit & development. Agreement + Phase 1 invoice issued.", invoiced: 3000, target: 14000 },
  { id: 3, client: "TUT Sprint", type: "Sprint", status: "active", rate: "$1k/day", weekly: "3–4 days", priority: "high", notes: "Imminent — flagged 28 Apr", invoiced: 0, target: 4000 },
  { id: 4, client: "TUT PeakAI Plan", type: "Sprint", status: "active", rate: "$800/day", weekly: "3–4 days", priority: "high", notes: "Imminent & pending — flagged 28 Apr", invoiced: 0, target: 3200 },
  { id: 5, client: "TUT Academy", type: "Project", status: "upcoming", rate: "$1k/day", weekly: "4 days", priority: "medium", notes: "June engagement", invoiced: 0, target: 4000 },
  { id: 6, client: "TUT PeakAI Implement", type: "Retainer", status: "pending-high", rate: "$800/day", weekly: "2 days/wk", priority: "high", notes: "~$43k / 90 days. Confirmation expected May. High-value conversion priority.", invoiced: 0, target: 43200 },
  { id: 7, client: "Better Briefs", type: "Pipeline", status: "pipeline", rate: "TBD", weekly: "—", priority: "medium", notes: "Kickoff done. Awaiting brief to scope proposal.", invoiced: 0, target: 0 },
  { id: 8, client: "ACAM", type: "Pipeline", status: "hold", rate: "TBD", weekly: "—", priority: "low", notes: "On hold 3–6 months.", invoiced: 0, target: 0 },
];

const REVENUE_TARGET = 200000;

const STATUS_META = {
  "active-high": { label: "Active — High", color: C.green },
  "active":       { label: "Active",         color: C.gold },
  "upcoming":     { label: "Upcoming",        color: "#7BA7C8" },
  "pending-high": { label: "Pending — High",  color: C.amber },
  "pipeline":     { label: "Pipeline",        color: C.muted },
  "hold":         { label: "On Hold",         color: "#556070" },
};

// ── Follow-ups ────────────────────────────────────────────────────────────────
const FOLLOWUPS_DEFAULT = [
  { id: 1, contact: "TUT (Tim O'Neill)", context: "TUT Sprint + PeakAI Plan — both flagged 28 Apr. Confirm start date and invoicing.", urgency: "high", due: "Today", email: "timo@timeundertension.ai", done: false },
  { id: 2, contact: "Julie Dormand", context: "Mumbrella360 networking meeting today at 3pm. Follow up post-meeting.", urgency: "high", due: "Today", email: "", done: false },
  { id: 3, contact: "Better Briefs", context: "Kickoff done. Awaiting brief to scope proposal — nudge if nothing by end of week.", urgency: "medium", due: "Fri 1 May", email: "", done: false },
  { id: 4, contact: "Louise Cummins", context: "Phase 1 invoice issued. Confirm receipt and project start date.", urgency: "medium", due: "This week", email: "", done: false },
  { id: 5, contact: "Mumbrella360 profile", context: "Email flagged: profile incomplete. Complete before networking opens fully.", urgency: "medium", due: "Today", email: "", done: false },
];

// ── Calendar events ───────────────────────────────────────────────────────────
const EVENTS = [
  { date: "Thu 30 Apr", time: "3:00pm", title: "Meeting — Julie Dormand", context: "Mumbrella360 Networking Event", type: "biz" },
  { date: "Fri 1 May",  time: "6:00am", title: "Monks 25 Minutes of AI",  context: "Webinar — needs action",         type: "learning" },
  { date: "Fri 1 May",  time: "2:30pm", title: "Miss Em & Ms Cat catch-up", context: "Plus humAIn crew",              type: "biz" },
  { date: "Mon 4 May",  time: "8:45am", title: "Dr Cherie Castain",        context: "",                               type: "biz" },
  { date: "Tue 5 May",  time: "1:00pm", title: "ACA Design Workshop",      context: "In-person — with Tim O'Neill & Jason Ross (TUT)", type: "client" },
  { date: "Wed 6 May",  time: "9:00am", title: "Weekly catch-up",          context: "With Belinda",                   type: "internal" },
];

const EVENT_COLORS = { biz: C.gold, client: C.green, learning: "#7BA7C8", internal: C.muted };

// ── Finance ───────────────────────────────────────────────────────────────────
const INCOME_DEFAULT = [
  { id: 1, label: "Louise Cummins — Phase 1", amount: 3000, month: "Apr", received: true },
  { id: 2, label: "Wink retainer — Apr",       amount: 3840, month: "Apr", received: true },
];

// ── Content: seeded post ideas ────────────────────────────────────────────────
const SEED_POSTS = [
  { id: 1, week: "W18", angle: "The AI readiness myth — most orgs optimise for adoption speed, not coherence. Why that backfires.", theme: "AI transformation", status: "idea", draft: "" },
  { id: 2, week: "W18", angle: "What editing a manuscript and AI advisory have in common: both are about finding the argument that's already there.", theme: "Narrative", status: "idea", draft: "" },
  { id: 3, week: "W19", angle: "humAIn origin story — why I ran Australia's first AI × creativity event in 2022, before it was obvious.", theme: "Credibility", status: "idea", draft: "" },
  { id: 4, week: "W19", angle: "System, Narrative, Experience. Why transformation stalls when one of these is missing.", theme: "Positioning", status: "idea", draft: "" },
  { id: 5, week: "W20", angle: "The Mumbrella360 observation: what you notice when you're the only person in the room who isn't selling something.", theme: "Industry", status: "idea", draft: "" },
  { id: 6, week: "W20", angle: "Story creates psychological safety. That's not a soft claim — it's neuroscience, and it's how transformation actually sticks.", theme: "AI transformation", status: "idea", draft: "" },
];

const POST_STATUS_META = {
  idea:      { label: "Idea",      color: C.muted },
  drafting:  { label: "Drafting",  color: "#7BA7C8" },
  ready:     { label: "Ready",     color: C.amber },
  published: { label: "Published", color: C.green },
};

const WEEKS  = ["W18", "W19", "W20", "W21"];
const THEMES = ["AI transformation", "Narrative", "Positioning", "Credibility", "Industry", "Experience", "humAIn"];

// ── Voice system prompt ───────────────────────────────────────────────────────
const VOICE_PROMPT = `You are writing a LinkedIn post for Cat McGinn, founder of Liminal & Co. (liminaland.co). Strategist at the intersection of AI, media, and creative leadership. Tagline: "Creating coherence in the age of AI."

VOICE RULES — follow precisely:

WHAT IT IS:
- Confident, direct, ideas-led. Short punchy sentences mixed with longer ones for rhythm.
- Satirical without cruelty. The target is a system or a pattern — not a person.
- Grounded in the specific. Earns generalisations by passing through the concrete first.
- Personally present without being confessional. The "I" does analytical work, not emotional work.
- Optimistic about human agency. Even when diagnosing a broken system, leaves a door open.
- Ends on a question, implication, or hand extended — never a tidy wrap-up.

WHAT IT IS NOT:
- Not preachy. Never tells the reader what to think.
- Not hedged. No "it could be argued." Makes the call.
- No jargon: no "ecosystem," "leverage," "learnings," "in this space."
- No performed emotion: no "heartbreaking," "inspiring," "I was devastated."
- No false binaries: no "it's not X, it's Y" constructions.
- No hollow transitions: no "At the end of the day," "Here's the thing," "The reality is."
- No inflation: no "groundbreaking," "transformative," "game-changing."
- No "I hope this resonates" or engagement-bait sign-offs.

FORMAT:
- 150–280 words
- Pure prose paragraphs — no headers, no bullet lists
- Do NOT start the post with "I" as the first word
- Add 2–3 relevant hashtags on a final separate line only

Output only the post text. No preamble, no explanation.`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `$${n.toLocaleString("en-AU")}`;

const Pill = ({ status, meta }) => {
  const m = meta[status] || { label: status, color: C.muted };
  return (
    <span style={{
      background: m.color + "22", color: m.color,
      border: `1px solid ${m.color}44`,
      borderRadius: 20, padding: "2px 10px",
      fontSize: 11, whiteSpace: "nowrap",
    }}>{m.label}</span>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const sectionLabel = { fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 };
const fieldLabel   = { fontSize: 10, color: C.muted, display: "block", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" };
const inputSt      = { background: "#0a1825", border: "1px solid #243548", borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" };
const selectSt     = { ...inputSt, cursor: "pointer" };
const btnPrimary   = { background: C.gold, color: C.night, border: "none", borderRadius: 5, padding: "9px 18px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, cursor: "pointer", letterSpacing: "0.05em" };
const btnSecondary = { background: "transparent", color: C.muted, border: `1px solid #243548`, borderRadius: 5, padding: "9px 18px", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" };

const TABS = ["Pipeline", "Content", "Finance", "Follow-up", "Calendar"];

// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,           setTab]           = useState("Pipeline");
  const [pipeline,      setPipeline]      = useState(PIPELINE_DEFAULT);
  const [followups,     setFollowups]     = useState(FOLLOWUPS_DEFAULT);
  const [income,        setIncome]        = useState(INCOME_DEFAULT);
  const [posts,         setPosts]         = useState(SEED_POSTS);
  const [editingPipeId, setEditingPipeId] = useState(null);
  const [addingIncome,  setAddingIncome]  = useState(false);
  const [newIncome,     setNewIncome]     = useState({ label: "", amount: "", month: "May", received: false });
  const [activeWeek,    setActiveWeek]    = useState("W18");
  const [expandedPost,  setExpandedPost]  = useState(null);
  const [generating,    setGenerating]    = useState(null);
  const [addingPost,    setAddingPost]    = useState(false);
  const [newPost,       setNewPost]       = useState({ angle: "", theme: THEMES[0], week: "W18" });
  const [copied,        setCopied]        = useState(null);
  const [loaded,        setLoaded]        = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p   = await window.storage.get("lco_pipeline");
        if (p)   setPipeline(JSON.parse(p.value));
        const f   = await window.storage.get("lco_followups");
        if (f)   setFollowups(JSON.parse(f.value));
        const inc = await window.storage.get("lco_income");
        if (inc) setIncome(JSON.parse(inc.value));
        const ps  = await window.storage.get("lco_posts");
        if (ps)  setPosts(JSON.parse(ps.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (key, val) => {
    try { await window.storage.set(key, JSON.stringify(val)); } catch {}
  }, []);

  const updatePipeline = (id, field, value) => {
    const next = pipeline.map(p => p.id === id ? { ...p, [field]: value } : p);
    setPipeline(next); save("lco_pipeline", next);
  };

  const toggleDone = (id) => {
    const next = followups.map(f => f.id === id ? { ...f, done: !f.done } : f);
    setFollowups(next); save("lco_followups", next);
  };

  const addIncomeItem = () => {
    if (!newIncome.label || !newIncome.amount) return;
    const next = [...income, { ...newIncome, id: Date.now(), amount: parseFloat(newIncome.amount) }];
    setIncome(next); save("lco_income", next);
    setNewIncome({ label: "", amount: "", month: "May", received: false });
    setAddingIncome(false);
  };

  const updatePost = useCallback((id, field, value) => {
    setPosts(prev => {
      const next = prev.map(p => p.id === id ? { ...p, [field]: value } : p);
      save("lco_posts", next);
      return next;
    });
  }, [save]);

  const addPost = () => {
    if (!newPost.angle.trim()) return;
    const next = [...posts, { ...newPost, id: Date.now(), status: "idea", draft: "" }];
    setPosts(next); save("lco_posts", next);
    setNewPost({ angle: "", theme: THEMES[0], week: activeWeek });
    setAddingPost(false);
  };

  const deletePost = (id) => {
    const next = posts.filter(p => p.id !== id);
    setPosts(next); save("lco_posts", next);
    if (expandedPost === id) setExpandedPost(null);
  };

  const generateDraft = async (post) => {
    setGenerating(post.id);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: VOICE_PROMPT,
          messages: [{
            role: "user",
            content: `Write a LinkedIn post based on this angle:\n\n"${post.angle}"\n\nTheme: ${post.theme}\n\nVoice: Cat McGinn. No AI tells. End on an opening, not a conclusion.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      if (text) {
        updatePost(post.id, "draft", text);
        updatePost(post.id, "status", "drafting");
        setExpandedPost(post.id);
      }
    } catch (e) { console.error(e); }
    setGenerating(null);
  };

  const copyToClipboard = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  // Revenue calcs
  const confirmedRevenue = pipeline.filter(p => ["active","active-high"].includes(p.status)).reduce((s,p) => s+(p.target||0), 0);
  const pendingRevenue   = pipeline.filter(p => p.status==="pending-high").reduce((s,p) => s+(p.target||0), 0);
  const receivedIncome   = income.filter(i => i.received).reduce((s,i) => s+i.amount, 0);
  const pct = Math.min(100, Math.round((confirmedRevenue/REVENUE_TARGET)*100));

  const weekPosts = posts.filter(p => p.week === activeWeek);

  if (!loaded) return (
    <div style={{ background: C.night, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.gold, fontFamily: "sans-serif", fontSize: 13, letterSpacing: "0.1em" }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ background: C.night, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.white, paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: C.nightMid, borderBottom: `1px solid ${C.gold}22`, padding: "18px 28px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100 }}>
        <Mark size={26} />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 200, fontSize: 16, letterSpacing: "0.18em" }}>LIMINAL</div>
        <div style={{ color: C.gold, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, fontWeight: 300, letterSpacing: "0.12em", marginTop: 1 }}>& Co.</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.06em" }}>Business OS</div>
      </div>

      {/* Revenue bar */}
      <div style={{ background: C.nightMid, padding: "14px 28px 12px", borderBottom: `1px solid ${C.night}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
          <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>2026 Revenue Target</div>
          <div style={{ fontSize: 11, color: C.gold }}>{fmt(confirmedRevenue)} confirmed · {fmt(pendingRevenue)} pending · {fmt(REVENUE_TARGET)} target</div>
        </div>
        <div style={{ background: C.night, borderRadius: 4, height: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldDim})`, borderRadius: 4, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ marginTop: 5, fontSize: 11, color: C.muted }}>{pct}% of target in confirmed active work</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.gold}22`, padding: "0 20px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none",
            borderBottom: `2px solid ${tab===t ? C.gold : "transparent"}`,
            color: tab===t ? C.gold : C.muted,
            padding: "13px 16px 11px", fontSize: 11, fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
            fontWeight: tab===t ? 400 : 300, whiteSpace: "nowrap",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "24px 24px" }}>

        {/* ── PIPELINE ── */}
        {tab === "Pipeline" && (
          <div>
            <div style={sectionLabel}>Active & Pipeline — {pipeline.length} engagements</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pipeline.map(p => {
                const isEditing = editingPipeId === p.id;
                const sm = STATUS_META[p.status] || {};
                return (
                  <div key={p.id} style={{ background: C.nightMid, border: `1px solid ${p.priority==="high" ? C.gold+"33" : C.nightLight}`, borderRadius: 8, padding: "14px 18px", cursor: "pointer" }}
                       onClick={() => setEditingPipeId(isEditing ? null : p.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 400, fontSize: 14, flex: 1, minWidth: 120 }}>{p.client}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{p.rate}</div>
                      <Pill status={p.status} meta={STATUS_META} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{p.notes}</div>
                    {p.target > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 3 }}>
                          <span>Invoiced: {fmt(p.invoiced)}</span><span>Target: {fmt(p.target)}</span>
                        </div>
                        <div style={{ background: C.night, borderRadius: 3, height: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100,(p.invoiced/p.target)*100)}%`, background: sm.color||C.gold, borderRadius: 3 }} />
                        </div>
                      </div>
                    )}
                    {isEditing && (
                      <div style={{ marginTop: 14, borderTop: `1px solid ${C.nightLight}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 130 }}>
                            <div style={fieldLabel}>Status</div>
                            <select value={p.status} onChange={e => updatePipeline(p.id, "status", e.target.value)} style={selectSt}>
                              {Object.keys(STATUS_META).map(k => <option key={k} value={k}>{STATUS_META[k].label}</option>)}
                            </select>
                          </div>
                          <div style={{ flex: 1, minWidth: 100 }}>
                            <div style={fieldLabel}>Invoiced ($)</div>
                            <input type="number" value={p.invoiced} onChange={e => updatePipeline(p.id,"invoiced",parseFloat(e.target.value)||0)} style={inputSt} />
                          </div>
                          <div style={{ flex: 1, minWidth: 100 }}>
                            <div style={fieldLabel}>Target ($)</div>
                            <input type="number" value={p.target} onChange={e => updatePipeline(p.id,"target",parseFloat(e.target.value)||0)} style={inputSt} />
                          </div>
                        </div>
                        <div>
                          <div style={fieldLabel}>Notes</div>
                          <textarea value={p.notes} onChange={e => updatePipeline(p.id,"notes",e.target.value)} rows={2} style={{ ...inputSt, resize: "none", width: "100%", boxSizing: "border-box" }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === "Content" && (
          <div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total ideas",  value: posts.length,                                    color: C.gold },
                { label: "Published",    value: posts.filter(p=>p.status==="published").length,   color: C.green },
                { label: "In progress",  value: posts.filter(p=>p.status!=="published").length,   color: C.amber },
              ].map(s => (
                <div key={s.label} style={{ background: C.nightMid, borderRadius: 8, padding: "14px 16px", border: `1px solid ${s.color}22` }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 200, color: s.color, fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Week selector + add button */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 2 }}>Week</div>
              {WEEKS.map(w => {
                const wc = posts.filter(p=>p.week===w).length;
                const hasReady = posts.some(p=>p.week===w && p.status==="ready");
                return (
                  <button key={w} onClick={() => setActiveWeek(w)} style={{
                    background: activeWeek===w ? C.gold : C.nightMid,
                    color: activeWeek===w ? C.night : C.muted,
                    border: `1px solid ${hasReady ? C.amber+"66" : activeWeek===w ? C.gold : C.nightLight}`,
                    borderRadius: 20, padding: "5px 14px", fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    {w}
                    {wc > 0 && <span style={{ background: activeWeek===w ? C.night+"33" : C.gold+"33", color: activeWeek===w ? C.night : C.gold, borderRadius: 10, padding: "0 5px", fontSize: 10 }}>{wc}</span>}
                  </button>
                );
              })}
              <div style={{ flex: 1 }} />
              <button onClick={() => { setAddingPost(true); setNewPost(n => ({ ...n, week: activeWeek })); }} style={btnPrimary}>+ Add idea</button>
            </div>

            {/* Add idea form */}
            {addingPost && (
              <div style={{ background: C.nightMid, borderRadius: 8, padding: "16px 18px", border: `1px solid ${C.gold}33`, marginBottom: 14 }}>
                <div style={fieldLabel}>Post angle / idea</div>
                <textarea
                  placeholder="What's the observation, tension, or argument?"
                  value={newPost.angle}
                  onChange={e => setNewPost(n => ({ ...n, angle: e.target.value }))}
                  rows={2}
                  style={{ ...inputSt, width: "100%", boxSizing: "border-box", resize: "none", marginBottom: 10 }}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <div style={{ flex: 2, minWidth: 120 }}>
                    <div style={fieldLabel}>Theme</div>
                    <select value={newPost.theme} onChange={e => setNewPost(n => ({ ...n, theme: e.target.value }))} style={{ ...selectSt, width: "100%" }}>
                      {THEMES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <div style={fieldLabel}>Week</div>
                    <select value={newPost.week} onChange={e => setNewPost(n => ({ ...n, week: e.target.value }))} style={{ ...selectSt, width: "100%" }}>
                      {WEEKS.map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => setAddingPost(false)} style={btnSecondary}>Cancel</button>
                  <button onClick={addPost} style={btnPrimary}>Save idea</button>
                </div>
              </div>
            )}

            {/* Post cards */}
            {weekPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: C.muted, fontSize: 13 }}>
                No ideas for {activeWeek} yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {weekPosts.map(post => {
                  const isExpanded = expandedPost === post.id;
                  const isGen      = generating === post.id;
                  const sm         = POST_STATUS_META[post.status] || {};
                  return (
                    <div key={post.id} style={{ background: C.nightMid, border: `1px solid ${post.status==="ready" ? C.amber+"44" : C.nightLight}`, borderRadius: 8, overflow: "hidden" }}>
                      {/* Card header — click to expand */}
                      <div style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}
                           onClick={() => setExpandedPost(isExpanded ? null : post.id)}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 7 }}>{post.angle}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: C.muted, background: C.nightLight, borderRadius: 4, padding: "2px 8px" }}>{post.theme}</span>
                            <Pill status={post.status} meta={POST_STATUS_META} />
                            {post.draft && <span style={{ fontSize: 11, color: C.muted }}>· draft ready</span>}
                          </div>
                        </div>
                        <span style={{ color: C.muted, fontSize: 13, flexShrink: 0, marginTop: 3 }}>{isExpanded ? "▲" : "▼"}</span>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div style={{ borderTop: `1px solid ${C.nightLight}`, padding: "16px 18px" }}>
                          {/* Status buttons */}
                          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                            <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 4 }}>Status</div>
                            {Object.entries(POST_STATUS_META).map(([k,v]) => (
                              <button key={k} onClick={() => updatePost(post.id, "status", k)} style={{
                                background: post.status===k ? v.color+"33" : "transparent",
                                color: post.status===k ? v.color : C.muted,
                                border: `1px solid ${post.status===k ? v.color+"66" : C.nightLight}`,
                                borderRadius: 20, padding: "3px 12px", fontSize: 11,
                                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                              }}>{v.label}</button>
                            ))}
                            <div style={{ flex: 1 }} />
                            <button onClick={() => deletePost(post.id)} style={{ ...btnSecondary, fontSize: 11, padding: "4px 12px", color: C.red+"cc", borderColor: C.red+"33" }}>Delete</button>
                          </div>

                          {/* Draft area */}
                          {post.draft ? (
                            <div>
                              <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Draft</div>
                              <textarea
                                value={post.draft}
                                onChange={e => updatePost(post.id, "draft", e.target.value)}
                                rows={11}
                                style={{ ...inputSt, width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
                              />
                              <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                                <button onClick={() => generateDraft(post)} style={{ ...btnSecondary, opacity: isGen ? 0.6 : 1 }} disabled={isGen}>
                                  {isGen ? "Generating…" : "↻ Regenerate"}
                                </button>
                                <button onClick={() => copyToClipboard(post.id, post.draft)} style={btnPrimary}>
                                  {copied === post.id ? "✓ Copied" : "Copy to clipboard"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ textAlign: "center", padding: "24px 0" }}>
                              <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>No draft yet. Generate one in your voice.</div>
                              <button onClick={() => generateDraft(post)} style={{ ...btnPrimary, opacity: isGen ? 0.7 : 1 }} disabled={isGen}>
                                {isGen
                                  ? <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                                      <span style={{ display: "inline-block", animation: "spin 1.2s linear infinite" }}>◌</span> Generating…
                                    </span>
                                  : "✦ Generate draft in my voice"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Voice note footer */}
            <div style={{ marginTop: 22, padding: "14px 18px", background: C.nightMid, borderRadius: 8, border: `1px solid ${C.gold}1a` }}>
              <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>On drafts</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                Generated in Cat's voice — direct, ideas-led, no AI tells, no tidy conclusions. The draft is a starting point. The finishing pass is yours.
              </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── FINANCE ── */}
        {tab === "Finance" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Received YTD",      value: fmt(receivedIncome),   color: C.green },
                { label: "Confirmed active",   value: fmt(confirmedRevenue), color: C.gold },
                { label: "High-value pending", value: fmt(pendingRevenue),   color: C.amber },
              ].map(s => (
                <div key={s.label} style={{ background: C.nightMid, borderRadius: 8, padding: "16px 18px", border: `1px solid ${s.color}33` }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 200, color: s.color, fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={sectionLabel}>Income log</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {income.map(i => (
                <div key={i.id} style={{ background: C.nightMid, borderRadius: 8, padding: "12px 18px", display: "flex", alignItems: "center", gap: 14, border: `1px solid ${C.nightLight}` }}>
                  <div style={{ flex: 1, fontSize: 13 }}>{i.label}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{i.month}</div>
                  <div style={{ fontSize: 14, color: i.received ? C.green : C.muted }}>{fmt(i.amount)}</div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: i.received ? C.green : C.muted }} />
                </div>
              ))}
            </div>
            {addingIncome ? (
              <div style={{ background: C.nightMid, borderRadius: 8, padding: "16px 18px", border: `1px solid ${C.gold}33` }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <input placeholder="Description" value={newIncome.label} onChange={e => setNewIncome(n=>({...n,label:e.target.value}))} style={{ ...inputSt, flex: 2, minWidth: 160 }} />
                  <input type="number" placeholder="Amount" value={newIncome.amount} onChange={e => setNewIncome(n=>({...n,amount:e.target.value}))} style={{ ...inputSt, flex: 1, minWidth: 100 }} />
                  <select value={newIncome.month} onChange={e => setNewIncome(n=>({...n,month:e.target.value}))} style={{ ...selectSt, flex: 1 }}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <label style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={newIncome.received} onChange={e=>setNewIncome(n=>({...n,received:e.target.checked}))} /> Received
                  </label>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => setAddingIncome(false)} style={btnSecondary}>Cancel</button>
                  <button onClick={addIncomeItem} style={btnPrimary}>Add</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingIncome(true)} style={btnPrimary}>+ Add income item</button>
            )}
          </div>
        )}

        {/* ── FOLLOW-UP ── */}
        {tab === "Follow-up" && (
          <div>
            <div style={sectionLabel}>{followups.filter(f=>!f.done).length} outstanding · {followups.filter(f=>f.done).length} done</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...followups].sort((a,b) => {
                if (a.done!==b.done) return a.done?1:-1;
                return ({high:0,medium:1,low:2}[a.urgency]||1)-({high:0,medium:1,low:2}[b.urgency]||1);
              }).map(f => {
                const uc = f.urgency==="high" ? C.red : f.urgency==="medium" ? C.amber : C.muted;
                return (
                  <div key={f.id} style={{ background: C.nightMid, border: `1px solid ${f.done?C.nightLight:uc+"33"}`, borderRadius: 8, padding: "14px 18px", opacity: f.done?0.5:1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div onClick={() => toggleDone(f.id)} style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${f.done?C.green:uc}`, background: f.done?C.green:"transparent", cursor: "pointer", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {f.done && <span style={{ color: C.white, fontSize: 10 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                          <div style={{ fontWeight: 400, fontSize: 14 }}>{f.contact}</div>
                          <span style={{ background: uc+"22", color: uc, border: `1px solid ${uc}44`, borderRadius: 20, padding: "1px 8px", fontSize: 10 }}>{f.urgency.toUpperCase()}</span>
                          <span style={{ fontSize: 11, color: C.muted }}>{f.due}</span>
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{f.context}</div>
                        {f.email && <a href={`mailto:${f.email}`} style={{ fontSize: 11, color: C.gold, textDecoration: "none", display: "block", marginTop: 5 }}>{f.email} →</a>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CALENDAR ── */}
        {tab === "Calendar" && (
          <div>
            <div style={sectionLabel}>Next 30 days — from your Google Calendar</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {EVENTS.map((e,i) => {
                const tc = EVENT_COLORS[e.type] || C.muted;
                return (
                  <div key={i} style={{ background: C.nightMid, borderRadius: 8, padding: "12px 18px", border: `1px solid ${C.nightLight}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 3, background: tc, borderRadius: 2, alignSelf: "stretch", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                        <div style={{ fontSize: 13, fontWeight: 400 }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{e.date} · {e.time}</div>
                      </div>
                      {e.context && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{e.context}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 16, flexWrap: "wrap" }}>
              {Object.entries(EVENT_COLORS).map(([type,color]) => (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  {type.charAt(0).toUpperCase()+type.slice(1)}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
