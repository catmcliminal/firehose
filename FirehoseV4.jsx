import { useState, useEffect, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300;1,8..60,400&display=swap');`;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:         "#0f0f0f",
  surface:    "#171717",
  surfaceHov: "#1e1e1e",
  border:     "#2a2a2a",
  borderHov:  "#3d3d3d",
  textPrimary:   "#f0ece4",
  textSecondary: "#a89f94",
  textMuted:     "#6b6460",
  textDim:       "#3d3a38",
  orange:     "#f97316",
  orangeDim:  "#7a3a0e",
  amber:      "#f59e0b",
  amberDim:   "#7a5007",
  blue:       "#60a5fa",
  violet:     "#a78bfa",
  fontDisplay: "'Playfair Display', serif",
  fontMono:    "'IBM Plex Mono', monospace",
  fontSerif:   "'Source Serif 4', serif",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK = [
  { id:1, title:"OpenAI's new reasoning model outperforms GPT-4o on every benchmark", source:"TechCrunch", sourceType:"rss", region:"global", topic:"AI Models", author:"Cade Metz", time:"14m ago", readTime:"6 min", trendScore:94, gemScore:12, trending:true, gem:false, summary:"The newly released o3-mini achieves state-of-the-art results across math, coding, and science reasoning while consuming 80% less compute.", editorNote:"The compute efficiency angle is what matters here — not the benchmark number. Watch how this reshapes enterprise AI procurement conversations.", engagement:{shares:4821,comments:312}, url:"#", submittedByPR:false },
  { id:2, title:"The quiet infrastructure crisis no one in Silicon Valley wants to talk about", source:"Stratechery", sourceType:"rss", region:"global", topic:"AI Infrastructure", author:"Ben Thompson", time:"2h ago", readTime:"18 min", trendScore:23, gemScore:96, trending:false, gem:true, summary:"Data centre power demands are now outpacing grid upgrades by 3x in key markets — and it breaks the hyperscaler growth story.", editorNote:"Ben's been circling this argument for months. This is the piece where it crystallises. Essential reading if you're advising on AI strategy.", engagement:{shares:89,comments:14}, url:"#", submittedByPR:false },
  { id:3, title:"Australian marketers still treating AI as a tool, not a transformation — new ACAM report", source:"Mumbrella", sourceType:"rss", region:"anz", topic:"AI & Marketing", author:"Zoe Samios", time:"1h ago", readTime:"5 min", trendScore:71, gemScore:38, trending:true, gem:false, summary:"ACAM's inaugural report finds 68% of Australian marketing teams are using AI for execution only, with fewer than 12% embedding it into strategy.", editorNote:"This is the local data point everyone's been waiting for. The strategy gap is where the consulting opportunity lives.", engagement:{shares:412,comments:88}, url:"#", submittedByPR:false },
  { id:4, title:"Why creativity is the last defensible moat in an AI-saturated market", source:"LinkedIn", sourceType:"linkedin", region:"global", topic:"Creative AI", author:"Rishad Tobaccowala", time:"3h ago", readTime:"9 min", trendScore:29, gemScore:91, trending:false, gem:true, summary:"A sharp argument that homogenisation of AI-generated content is creating scarcity value for genuinely original creative thinking.", editorNote:"This maps almost perfectly onto the System 3 thinking argument. Worth reading alongside the Wharton paper.", engagement:{shares:203,comments:71}, url:"#", submittedByPR:false },
  { id:5, title:"My First Voice: How AI is giving non-verbal children language for the first time", source:"MIT Tech Review", sourceType:"rss", region:"global", topic:"AI & Society", author:"Jessica Hamzelou", time:"6h ago", readTime:"14 min", trendScore:17, gemScore:97, trending:false, gem:true, summary:"A deeply reported feature on AI-powered AAC tools enabling communication for children with severe speech impairments — and the ethical questions they raise.", editorNote:"This is the hopeful close. When we talk about AI homogenising creativity, this is what the counter-argument looks like.", engagement:{shares:41,comments:19}, url:"#", submittedByPR:false },
  { id:6, title:"AdTech Australia launches AI transparency charter — 23 signatories at launch", source:"AdNews", sourceType:"rss", region:"anz", topic:"AI Policy", author:"Arvind Hickman", time:"2h ago", readTime:"4 min", trendScore:64, gemScore:41, trending:true, gem:false, summary:"A new industry-led charter commits signatories to disclose AI use in advertising creative, targeting, and measurement.", editorNote:"Worth watching. The self-regulatory instinct is understandable, but the absence of teeth is already being noted.", engagement:{shares:287,comments:54}, url:"#", submittedByPR:false },
  { id:7, title:"Salesforce Einstein gets generative overhaul — enterprise AI race heats up", source:"Reuters", sourceType:"rss", region:"global", topic:"AI & Business", author:"Ann Saphir", time:"45m ago", readTime:"4 min", trendScore:88, gemScore:14, trending:true, gem:false, summary:"Salesforce has announced a comprehensive update to Einstein, integrating generative capabilities across Sales, Service, and Marketing Cloud.", editorNote:null, engagement:{shares:3102,comments:445}, url:"#", submittedByPR:false },
  { id:8, title:"The model collapse problem is worse than we thought — and it's already happening", source:"r/MachineLearning", sourceType:"reddit", region:"global", topic:"AI Models", author:"u/ml_researcher_anon", time:"8h ago", readTime:"16 min", trendScore:12, gemScore:93, trending:false, gem:true, summary:"New evidence that training on AI-generated content is degrading model quality faster than predicted — with implications for every major lab.", editorNote:"The Reddit thread is dense but the linked paper is accessible. Model collapse is the foundational problem of the next AI generation.", engagement:{shares:28,comments:312}, url:"#", submittedByPR:false },
];

const TOPICS = ["All", "AI Models", "AI & Marketing", "Creative AI", "AI Infrastructure", "AI & Business", "AI Policy", "AI & Society"];
const REGIONS = ["Global + ANZ", "ANZ only", "Global only"];
const SRC = {
  rss:      { icon: "◈", color: T.orange },
  linkedin: { icon: "in", color: T.blue },
  reddit:   { icon: "↑",  color: "#ff6534" },
  pr:       { icon: "⊕",  color: T.violet },
};

// ─── SCORE BAR ────────────────────────────────────────────────────────────────
function ScoreBar({ value, color, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textMuted, width:58, letterSpacing:"0.06em", flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:3, background:"#252525", borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:color, borderRadius:2, transition:"width 0.8s ease" }} />
      </div>
      <span style={{ fontFamily:T.fontMono, fontSize:11, fontWeight:500, color, width:26, textAlign:"right", flexShrink:0 }}>{value}</span>
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ color, bg, children }) {
  return (
    <span style={{
      fontFamily:T.fontMono, fontSize:10, fontWeight:500,
      color, background:bg,
      border:`1px solid ${color}40`,
      padding:"3px 9px", borderRadius:3,
      letterSpacing:"0.1em", whiteSpace:"nowrap"
    }}>{children}</span>
  );
}

// ─── ARTICLE CARD ─────────────────────────────────────────────────────────────
function ArticleCard({ article, index }) {
  const [open, setOpen] = useState(false);
  const { trending, gem, submittedByPR, sourceType } = article;
  const src = submittedByPR ? SRC.pr : (SRC[sourceType] || SRC.rss);
  const accent = gem ? T.amber : trending ? T.orange : T.border;
  const accentBg = gem ? T.amberDim + "30" : trending ? T.orangeDim + "30" : "transparent";

  return (
    <article
      onClick={() => setOpen(!open)}
      style={{
        background: open ? T.surfaceHov : T.surface,
        borderRadius: 6,
        border: `1px solid ${open ? accent + "60" : T.border}`,
        borderLeft: `4px solid ${accent}`,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.18s ease",
        animation: `slideIn 0.35s ease ${Math.min(index,7)*45}ms both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHov; e.currentTarget.style.borderColor = T.borderHov; }}
      onMouseLeave={e => { e.currentTarget.style.background = open ? T.surfaceHov : T.surface; e.currentTarget.style.borderColor = open ? accent+"60" : T.border; }}
    >
      {/* Row 1: badges + source pill */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, gap:12, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          {trending && <Badge color={T.orange} bg="#7a3a0e40">▲ TRENDING</Badge>}
          {gem      && <Badge color={T.amber}  bg="#7a500740">◆ GEM</Badge>}
          {submittedByPR && <Badge color={T.violet} bg="#4c2f8040">⊕ SUBMITTED</Badge>}
          {article.region==="anz" && <Badge color={T.blue} bg="#1e3a5f40">ANZ</Badge>}
          <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textMuted, background:"#ffffff0a", padding:"3px 9px", borderRadius:3, letterSpacing:"0.08em" }}>
            {article.topic.toUpperCase()}
          </span>
        </div>
        <span style={{
          fontFamily:T.fontMono, fontSize:11, fontWeight:500,
          color: src.color, background: src.color + "18",
          border:`1px solid ${src.color}35`,
          padding:"4px 10px", borderRadius:4, flexShrink:0
        }}>{src.icon} {article.source}</span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700,
        color: T.textPrimary, margin:"0 0 10px", lineHeight:1.32, letterSpacing:"-0.01em"
      }}>{article.title}</h3>

      {/* Meta row */}
      <div style={{ display:"flex", gap:0, marginBottom:16, alignItems:"center" }}>
        <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textSecondary }}>{article.author}</span>
        <span style={{ margin:"0 10px", color:T.textDim, fontSize:13 }}>·</span>
        <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textSecondary }}>{article.time}</span>
        <span style={{ margin:"0 10px", color:T.textDim, fontSize:13 }}>·</span>
        <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textMuted }}>{article.readTime} read</span>
      </div>

      {/* Scores */}
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        <ScoreBar value={article.trendScore} color={T.orange} label="TRENDING" />
        <ScoreBar value={article.gemScore}   color={T.amber}  label="GEM" />
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ marginTop:20, borderTop:`1px solid ${T.border}`, paddingTop:20 }}>
          <p style={{ fontFamily:T.fontSerif, fontSize:15, color:T.textSecondary, lineHeight:1.75, margin:"0 0 16px", fontWeight:300 }}>
            {article.summary}
          </p>

          {article.editorNote && (
            <div style={{ background:T.amber+"0d", border:`1px solid ${T.amber}30`, borderLeft:`3px solid ${T.amber}`, borderRadius:3, padding:"14px 16px", marginBottom:18 }}>
              <p style={{ fontFamily:T.fontMono, fontSize:10, fontWeight:500, color:T.amber+"99", letterSpacing:"0.12em", margin:"0 0 7px" }}>EDITOR'S NOTE</p>
              <p style={{ fontFamily:T.fontSerif, fontStyle:"italic", fontSize:14, color:"#c8b896", lineHeight:1.72, margin:0, fontWeight:300 }}>
                {article.editorNote}
              </p>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textMuted }}>↑ {article.engagement.shares.toLocaleString()}</span>
            <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textMuted }}>◯ {article.engagement.comments.toLocaleString()}</span>
            <a
              href={article.url} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                marginLeft:"auto",
                fontFamily:T.fontMono, fontSize:11, fontWeight:500,
                color: "#0f0f0f",
                background: accent,
                textDecoration:"none",
                padding:"8px 18px", borderRadius:5,
                letterSpacing:"0.08em",
                transition:"opacity 0.15s",
                display:"inline-block"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >READ FULL PIECE →</a>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── LIVE TICKER ──────────────────────────────────────────────────────────────
function LiveTicker({ articles }) {
  const trending = articles.filter(a => a.trending);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!trending.length) return;
    const t = setInterval(() => setIdx(i => (i+1) % trending.length), 4500);
    return () => clearInterval(t);
  }, [trending.length]);
  if (!trending.length) return null;
  const cur = trending[idx % trending.length];
  return (
    <div style={{ background:"#0a0a0a", borderBottom:`1px solid ${T.border}`, padding:"8px 28px", display:"flex", alignItems:"center", gap:14, overflow:"hidden" }}>
      <span style={{ fontFamily:T.fontMono, fontSize:10, fontWeight:500, color:T.orange, background:T.orange+"20", border:`1px solid ${T.orange}35`, padding:"3px 10px", borderRadius:3, letterSpacing:"0.12em", whiteSpace:"nowrap" }}>▲ LIVE</span>
      <p key={idx} style={{ fontFamily:T.fontMono, fontSize:11, color:T.textSecondary, margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", animation:"fadeUp 0.3s ease" }}>
        <span style={{ color:T.orange+"aa", marginRight:6 }}>{cur?.source} ·</span>{cur?.title}
      </p>
      <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textDim, marginLeft:"auto", whiteSpace:"nowrap" }}>{trending.length} trending</span>
    </div>
  );
}

// ─── TAB BUTTON ───────────────────────────────────────────────────────────────
function TabBtn({ active, accent, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? accent+"22" : "transparent",
      border: "none",
      borderBottom: `2px solid ${active ? accent : "transparent"}`,
      color: active ? accent : T.textMuted,
      fontFamily:T.fontMono, fontSize:11, fontWeight: active ? 500 : 400,
      letterSpacing:"0.09em", padding:"0 18px",
      height:"100%", cursor:"pointer",
      transition:"all 0.15s",
    }}>{children}</button>
  );
}

// ─── ICON BUTTON ─────────────────────────────────────────────────────────────
function IconBtn({ onClick, children, accent, filled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: filled ? accent : hov ? accent+"22" : "transparent",
        border: `1.5px solid ${filled ? accent : hov ? accent : T.border}`,
        color: filled ? "#0f0f0f" : hov ? accent : T.textSecondary,
        fontFamily:T.fontMono, fontSize:11, fontWeight:500,
        padding:"7px 16px", borderRadius:5, cursor:"pointer",
        letterSpacing:"0.08em", transition:"all 0.15s", whiteSpace:"nowrap",
      }}
    >{children}</button>
  );
}

// ─── PR MODAL ────────────────────────────────────────────────────────────────
function PRModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ headline:"", summary:"", url:"", company:"", contact:"", topic:"AI & Marketing" });
  const [preview, setPreview] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const fetchPreview = async () => {
    if (!form.url) return;
    setFetching(true);
    await new Promise(r => setTimeout(r, 800));
    try { setPreview({ domain: new URL(form.url).hostname }); } catch { setPreview({ domain: form.url }); }
    setFetching(false);
  };

  const handleSubmit = () => {
    if (!form.headline || !form.url || !form.company) return;
    setDone(true);
    setTimeout(() => {
      onSubmit({ id:`pr-${Date.now()}`, ...form, sourceType:"pr", submittedByPR:true, region:"global", trending:false, gem:false, trendScore:0, gemScore:0, time:"just now", readTime:"—", author:form.company, source:form.company, engagement:{shares:0,comments:0}, editorNote:null, pubDate:new Date().toISOString() });
      onClose();
    }, 900);
  };

  const inp = {
    width:"100%", background:"#111", border:`1px solid ${T.border}`,
    borderRadius:5, padding:"10px 14px",
    fontFamily:T.fontMono, fontSize:12, color:T.textPrimary,
    boxSizing:"border-box", outline:"none", transition:"border-color 0.15s"
  };
  const lbl = { fontFamily:T.fontMono, fontSize:10, fontWeight:500, color:T.textMuted, letterSpacing:"0.1em", display:"block", marginBottom:7 };

  return (
    <div style={{ position:"fixed", inset:0, background:"#000000bb", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, width:"100%", maxWidth:520, maxHeight:"88vh", overflowY:"auto", padding:"32px 36px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:22, color:T.textPrimary, margin:"0 0 6px", fontWeight:700 }}>Submit a story</h2>
            <p style={{ fontFamily:T.fontMono, fontSize:11, color:T.textMuted, margin:0 }}>Editorial review within 24 hours.</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:4, color:T.textMuted, fontSize:16, cursor:"pointer", padding:"2px 10px", lineHeight:1.5 }}>✕</button>
        </div>

        {done ? (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <p style={{ fontFamily:T.fontDisplay, fontSize:22, color:T.amber, marginBottom:10 }}>Received.</p>
            <p style={{ fontFamily:T.fontMono, fontSize:11, color:T.textMuted }}>We'll review and be in touch at {form.contact || "your email"}.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div><label style={lbl}>HEADLINE *</label><input style={inp} placeholder="Your story headline" value={form.headline} onChange={e => set("headline",e.target.value)} onFocus={e => e.target.style.borderColor=T.orange} onBlur={e => e.target.style.borderColor=T.border} /></div>
            <div><label style={lbl}>SUMMARY</label><textarea style={{...inp,resize:"vertical",minHeight:80,lineHeight:1.65}} placeholder="2–3 sentences" value={form.summary} onChange={e => set("summary",e.target.value)} onFocus={e => e.target.style.borderColor=T.orange} onBlur={e => e.target.style.borderColor=T.border} /></div>
            <div>
              <label style={lbl}>DESTINATION URL *</label>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{...inp,flex:1}} placeholder="https://…" value={form.url} onChange={e => { set("url",e.target.value); setPreview(null); }} onFocus={e => e.target.style.borderColor=T.orange} onBlur={e => e.target.style.borderColor=T.border} />
                <button onClick={fetchPreview} style={{ background:T.orange+"22", border:`1.5px solid ${T.orange}`, color:T.orange, fontFamily:T.fontMono, fontSize:11, fontWeight:500, padding:"0 16px", borderRadius:5, cursor:"pointer", whiteSpace:"nowrap", letterSpacing:"0.08em" }}>
                  {fetching ? "…" : "PREVIEW"}
                </button>
              </div>
              {preview && (
                <div style={{ marginTop:10, background:"#111", border:`1px solid ${T.border}`, borderRadius:5, padding:"12px 14px" }}>
                  <p style={{ fontFamily:T.fontMono, fontSize:10, color:T.textMuted, margin:"0 0 5px", letterSpacing:"0.1em" }}>LANDING PAGE</p>
                  <p style={{ fontFamily:T.fontMono, fontSize:12, fontWeight:500, color:T.orange, margin:0 }}>{preview.domain}</p>
                </div>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div><label style={lbl}>COMPANY *</label><input style={inp} placeholder="Acme Agency" value={form.company} onChange={e => set("company",e.target.value)} onFocus={e => e.target.style.borderColor=T.orange} onBlur={e => e.target.style.borderColor=T.border} /></div>
              <div>
                <label style={lbl}>TOPIC</label>
                <select style={{...inp,cursor:"pointer"}} value={form.topic} onChange={e => set("topic",e.target.value)}>
                  {TOPICS.filter(t=>t!=="All").map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div><label style={lbl}>CONTACT EMAIL</label><input style={inp} placeholder="you@agency.com" value={form.contact} onChange={e => set("contact",e.target.value)} onFocus={e => e.target.style.borderColor=T.orange} onBlur={e => e.target.style.borderColor=T.border} /></div>
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:18, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <p style={{ fontFamily:T.fontMono, fontSize:10, color:T.textDim, margin:0, lineHeight:1.65 }}>Not all submissions will be published.</p>
              <button
                onClick={handleSubmit}
                disabled={!form.headline||!form.url||!form.company}
                style={{
                  background: form.headline&&form.url&&form.company ? T.orange : "#1f1f1f",
                  border: "none",
                  color: form.headline&&form.url&&form.company ? "#0f0f0f" : T.textDim,
                  fontFamily:T.fontMono, fontSize:11, fontWeight:600,
                  padding:"10px 24px", borderRadius:5, cursor: form.headline&&form.url&&form.company ? "pointer" : "not-allowed",
                  letterSpacing:"0.1em", transition:"all 0.2s", whiteSpace:"nowrap"
                }}
              >SUBMIT →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function Firehose() {
  const [articles, setArticles]     = useState(MOCK);
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeRegion, setActiveRegion] = useState("Global + ANZ");
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [showPR, setShowPR]         = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const filtered = articles.filter(a => {
    const matchTopic  = activeTopic==="All" || a.topic===activeTopic;
    const matchRegion = activeRegion==="Global + ANZ" || (activeRegion==="ANZ only"&&a.region==="anz") || (activeRegion==="Global only"&&a.region!=="anz");
    const matchFilter = filter==="all" || (filter==="trending"&&a.trending) || (filter==="gems"&&a.gem);
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.source?.toLowerCase().includes(search.toLowerCase()) || a.topic?.toLowerCase().includes(search.toLowerCase());
    return matchTopic && matchRegion && matchFilter && matchSearch;
  });

  const topicCounts = {};
  TOPICS.forEach(t => { topicCounts[t] = t==="All" ? articles.length : articles.filter(a=>a.topic===t).length; });

  return (
    <>
      <style>{FONTS}{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${T.bg};}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes flicker{0%,89%,100%{opacity:1}90%{opacity:.5}92%{opacity:1}94%{opacity:.6}96%{opacity:1}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:${T.bg}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
        select option{background:#1a1a1a;color:${T.textPrimary};}
      `}</style>

      <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column" }}>

        {/* ── HEADER ── */}
        <header style={{ borderBottom:`1px solid ${T.border}`, padding:"0 28px", background:"#0a0a0a", position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", height:58, gap:0 }}>

          {/* Wordmark */}
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginRight:24, flexShrink:0 }}>
            <h1 style={{ fontFamily:T.fontDisplay, fontSize:24, fontWeight:900, color:T.orange, letterSpacing:"-0.02em", animation:"flicker 10s infinite", margin:0 }}>FIREHOSE</h1>
            <span style={{ fontFamily:T.fontMono, fontSize:9, color:T.textDim, letterSpacing:"0.14em" }}>AI INTELLIGENCE</span>
          </div>

          {/* View tabs */}
          <div style={{ display:"flex", height:"100%", gap:2 }}>
            <TabBtn active={filter==="all"} accent={T.orange} onClick={()=>setFilter("all")}>ALL</TabBtn>
            <TabBtn active={filter==="trending"} accent={T.orange} onClick={()=>setFilter("trending")}>▲ TRENDING</TabBtn>
            <TabBtn active={filter==="gems"} accent={T.amber} onClick={()=>setFilter("gems")}>◆ GEMS</TabBtn>
          </div>

          {/* Region select */}
          <select
            value={activeRegion}
            onChange={e=>setActiveRegion(e.target.value)}
            style={{
              marginLeft:20, background:"#111", border:`1.5px solid ${T.border}`,
              borderRadius:5, color:T.textSecondary,
              fontFamily:T.fontMono, fontSize:11, padding:"6px 12px",
              cursor:"pointer", outline:"none", transition:"border-color 0.15s"
            }}
            onFocus={e=>e.target.style.borderColor=T.orange}
            onBlur={e=>e.target.style.borderColor=T.border}
          >
            {REGIONS.map(r=><option key={r}>{r}</option>)}
          </select>

          {/* Search */}
          <div style={{ marginLeft:12, position:"relative", flexShrink:0 }}>
            <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color: searchFocus ? T.orange : T.textDim, fontSize:14, pointerEvents:"none", transition:"color 0.15s" }}>⌕</span>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search feeds…"
              onFocus={()=>setSearchFocus(true)}
              onBlur={()=>setSearchFocus(false)}
              style={{
                background:"#111", border:`1.5px solid ${searchFocus ? T.orange : T.border}`,
                borderRadius:5, padding:"6px 12px 6px 32px",
                fontFamily:T.fontMono, fontSize:11, color:T.textPrimary,
                width:172, outline:"none", transition:"border-color 0.15s"
              }}
            />
          </div>

          {/* Submit CTA */}
          <div style={{ marginLeft:"auto" }}>
            <IconBtn onClick={()=>setShowPR(true)} accent={T.orange} filled>⊕ SUBMIT A STORY</IconBtn>
          </div>
        </header>

        {/* ── TICKER ── */}
        <LiveTicker articles={articles} />

        {/* ── BODY ── */}
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

          {/* Sidebar */}
          <nav style={{ width:196, borderRight:`1px solid ${T.border}`, padding:"22px 0", flexShrink:0, overflowY:"auto", background:"#0c0c0c" }}>
            <p style={{ fontFamily:T.fontMono, fontSize:10, fontWeight:500, color:T.textDim, letterSpacing:"0.14em", padding:"0 18px 12px", margin:0 }}>TOPICS</p>
            {TOPICS.map(t => {
              const active = activeTopic===t;
              return (
                <button key={t} onClick={()=>setActiveTopic(t)} style={{
                  background: active ? T.orange+"18" : "transparent",
                  border:"none",
                  borderLeft:`3px solid ${active ? T.orange : "transparent"}`,
                  color: active ? T.orange : T.textSecondary,
                  fontFamily:T.fontMono, fontSize:11, fontWeight: active ? 500 : 400,
                  padding:"8px 18px", cursor:"pointer", textAlign:"left",
                  width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
                  transition:"all 0.12s", letterSpacing:"0.03em"
                }}
                  onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="#ffffff08"; e.currentTarget.style.color=T.textPrimary; }}}
                  onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.textSecondary; }}}
                >
                  <span>{t}</span>
                  <span style={{ fontFamily:T.fontMono, fontSize:10, color: active ? T.orange+"88" : T.textDim, background: active ? T.orange+"18" : "#ffffff08", padding:"1px 7px", borderRadius:3 }}>{topicCounts[t]}</span>
                </button>
              );
            })}

            {/* Source legend */}
            <div style={{ margin:"24px 18px 0", paddingTop:18, borderTop:`1px solid ${T.border}` }}>
              <p style={{ fontFamily:T.fontMono, fontSize:10, fontWeight:500, color:T.textDim, letterSpacing:"0.12em", marginBottom:14 }}>SOURCES</p>
              {[
                {key:"rss",      label:"RSS / News"},
                {key:"reddit",   label:"Reddit"},
                {key:"linkedin", label:"LinkedIn"},
                {key:"pr",       label:"Submitted"},
              ].map(s => (
                <div key={s.key} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
                  <span style={{ color:SRC[s.key].color, fontFamily:T.fontMono, fontSize:12, width:18, textAlign:"center" }}>{SRC[s.key].icon}</span>
                  <span style={{ fontFamily:T.fontMono, fontSize:11, color:T.textSecondary }}>{s.label}</span>
                  <span style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:SRC[s.key].color, animation:"pulse 2.2s infinite" }} />
                </div>
              ))}
            </div>
          </nav>

          {/* Feed */}
          <main style={{ flex:1, padding:"22px 24px", overflowY:"auto" }}>
            {/* Controls bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <p style={{ fontFamily:T.fontMono, fontSize:11, color:T.textMuted, margin:0 }}>
                {filtered.length} articles
                {activeTopic!=="All" && <span style={{ color:T.orange }}> · {activeTopic}</span>}
                {activeRegion!=="Global + ANZ" && <span style={{ color:T.blue }}> · {activeRegion}</span>}
              </p>
              <div style={{ display:"flex", gap:6 }}>
                <Badge color={T.orange} bg={T.orange+"18"}>▲ TRENDING</Badge>
                <Badge color={T.amber}  bg={T.amber+"18"}>◆ GEM</Badge>
              </div>
            </div>

            {/* Article list */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filtered.map((a,i) => <ArticleCard key={a.id} article={a} index={i} />)}
              {filtered.length===0 && (
                <div style={{ textAlign:"center", padding:"72px 0" }}>
                  <p style={{ fontFamily:T.fontMono, fontSize:13, color:T.textDim }}>No articles match your filters.</p>
                </div>
              )}
            </div>
          </main>

          {/* Stats panel */}
          <aside style={{ width:210, borderLeft:`1px solid ${T.border}`, padding:"22px 18px", flexShrink:0, background:"#0c0c0c" }}>
            <p style={{ fontFamily:T.fontMono, fontSize:10, fontWeight:500, color:T.textDim, letterSpacing:"0.14em", marginBottom:20 }}>FEED STATS</p>

            {[
              {label:"IN FEED",     value:filtered.length,                                 color:T.textPrimary},
              {label:"TRENDING",    value:filtered.filter(a=>a.trending).length,           color:T.orange},
              {label:"HIDDEN GEMS", value:filtered.filter(a=>a.gem).length,               color:T.amber},
              {label:"ANZ",         value:filtered.filter(a=>a.region==="anz").length,    color:T.blue},
              {label:"SUBMITTED",   value:filtered.filter(a=>a.submittedByPR).length,     color:T.violet},
            ].map(s => (
              <div key={s.label} style={{ marginBottom:20 }}>
                <p style={{ fontFamily:T.fontMono, fontSize:10, color:T.textDim, margin:"0 0 4px", letterSpacing:"0.1em" }}>{s.label}</p>
                <p style={{ fontFamily:T.fontDisplay, fontSize:28, color:s.color, fontWeight:700, margin:0, lineHeight:1 }}>{s.value}</p>
              </div>
            ))}

            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:18, marginTop:4 }}>
              <p style={{ fontFamily:T.fontMono, fontSize:10, color:T.textDim, letterSpacing:"0.12em", marginBottom:12 }}>TOP STORIES</p>
              {articles.sort((a,b)=>b.trendScore-a.trendScore).slice(0,4).map((a,i)=>(
                <div key={a.id} style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
                  <span style={{ fontFamily:T.fontMono, fontSize:10, color:T.textDim, lineHeight:1.5, flexShrink:0 }}>{String(i+1).padStart(2,"0")}</span>
                  <p style={{ fontFamily:T.fontSerif, fontSize:12, color:T.textMuted, lineHeight:1.5, margin:0, fontWeight:300 }}>
                    {a.title.slice(0,58)}{a.title.length>58?"…":""}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {showPR && <PRModal onClose={()=>setShowPR(false)} onSubmit={a=>setArticles(prev=>[a,...prev])} />}
    </>
  );
}
