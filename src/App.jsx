import { useState, useEffect } from 'react'

const fontLink = document.createElement('link')
fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=EB+Garamond:wght@400;600&display=swap'
fontLink.rel = 'stylesheet'
document.head.appendChild(fontLink)

const SUPABASE_URL = 'https://dgzzwgfpbnzyccfakobw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_u_n3MB-ozI8LgNJeS1IR6Q_5GQtv5ts'
const CACHE_KEY = 'firehose-cache-v5'
const CACHE_TTL = 60 * 60 * 1000

const SOURCES = [
  { id: 'abi',         name: 'How Not To Use AI',       url: 'https://abiawomosu.substack.com/feed',                                      type: 'substack',    tier: 3 },
  { id: 'tut',         name: 'Time Under Tension',       url: 'https://timeundertension.substack.com/feed',                                type: 'substack',    tier: 3 },
  { id: 'ruben',       name: 'How to AI',                url: 'https://ruben.substack.com/feed',                                           type: 'substack',    tier: 3 },
  { id: 'aigov',       name: 'AI Governance',            url: 'https://aigovernancelead.substack.com/feed',                                type: 'substack',    tier: 3 },
  { id: 'mittr',       name: 'MIT Tech Review',          url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',       type: 'publication', tier: 1 },
  { id: 'adweek',      name: 'Adweek',                   url: 'https://www.adweek.com/category/artificial-intelligence/feed',              type: 'publication', tier: 2 },
  { id: 'drum',        name: 'The Drum',                 url: 'https://www.thedrum.com/rss',                                               type: 'publication', tier: 2 },
  { id: 'mumbrella',   name: 'Mumbrella',                url: 'https://mumbrella.com.au/feed',                                             type: 'publication', tier: 3 },
  { id: 'mdive',       name: 'Marketing Dive',           url: 'https://www.marketingdive.com/feeds/news',                                  type: 'publication', tier: 2 },
  { id: 'verge',       name: 'The Verge',                url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',         type: 'publication', tier: 1 },
  { id: 'wired',       name: 'Wired',                    url: 'https://www.wired.com/feed/tag/ai/rss',                                     type: 'publication', tier: 1 },
  { id: 'adnews',      name: 'AdNews',                   url: 'https://www.adnews.com.au/feed',                                            type: 'publication', tier: 3 },
  { id: 'rai',         name: 'r/ArtificialIntelligence', url: 'https://www.reddit.com/r/ArtificialIntelligence/.rss',                      type: 'reddit',      tier: 4 },
  { id: 'rartificial', name: 'r/artificial',             url: 'https://www.reddit.com/r/artificial/.rss',                                  type: 'reddit',      tier: 4 },
  { id: 'rml',         name: 'r/MachineLearning',        url: 'https://www.reddit.com/r/MachineLearning/.rss',                             type: 'reddit',      tier: 4 },
  { id: 'rchatgpt',    name: 'r/ChatGPT',                url: 'https://www.reddit.com/r/ChatGPT/.rss',                                     type: 'reddit',      tier: 4 },
  { id: 'raiart',      name: 'r/AIArt',                  url: 'https://www.reddit.com/r/AIArt/.rss',                                       type: 'reddit',      tier: 4 },
  { id: 'rmarketing',  name: 'r/marketing',              url: 'https://www.reddit.com/r/marketing/.rss',                                   type: 'reddit',      tier: 4 },
  { id: 'ropenai',     name: 'r/OpenAI',                 url: 'https://www.reddit.com/r/OpenAI/.rss',                                      type: 'reddit',      tier: 4 },
]

const TOPICS = [
  { id: 'all',               label: 'All',              keywords: [] },
  { id: 'ai-models',         label: 'AI Models',        keywords: ['gpt', 'claude', 'gemini', 'llm', 'large language model', 'openai', 'anthropic', 'mistral', 'llama', 'deepseek', 'foundation model', 'chatgpt', 'copilot', 'grok', 'model release', 'benchmark'] },
  { id: 'ai-marketing',      label: 'AI & Marketing',   keywords: ['marketing', 'advertising', 'brand', 'campaign', 'agency', 'media buy', 'programmatic', 'adtech', 'martech', 'content marketing', 'personalisation', 'personalization', 'audience', 'consumer', 'ad creative'] },
  { id: 'creative-ai',       label: 'Creative x AI',    keywords: ['creative', 'design', 'art', 'image generation', 'midjourney', 'stable diffusion', 'dall-e', 'music', 'video generation', 'generative art', 'creativity', 'adobe', 'figma', 'visual', 'filmmaker', 'writer', 'artist'] },
  { id: 'ai-infrastructure', label: 'AI Infrastructure',keywords: ['infrastructure', 'compute', 'gpu', 'chip', 'nvidia', 'data center', 'cloud', 'training', 'inference', 'hardware', 'semiconductor', 'vector database', 'mlops', 'deployment', 'open source'] },
  { id: 'ai-business',       label: 'AI & Business',    keywords: ['enterprise', 'startup', 'investment', 'funding', 'revenue', 'roi', 'productivity', 'workforce', 'jobs', 'strategy', 'ceo', 'leadership', 'business', 'economy', 'layoff', 'hiring', 'valuation'] },
  { id: 'ai-policy',         label: 'AI Policy',        keywords: ['regulation', 'policy', 'governance', 'law', 'ethics', 'safety', 'risk', 'bias', 'copyright', 'government', 'eu ai act', 'legislation', 'compliance', 'responsible ai', 'alignment', 'ban'] },
  { id: 'ai-society',        label: 'AI & Society',     keywords: ['society', 'culture', 'education', 'healthcare', 'climate', 'inequality', 'future of work', 'human', 'impact', 'social', 'privacy', 'surveillance', 'democracy', 'journalism', 'media'] },
  { id: 'rogue-ai',          label: 'Rogue AI',         keywords: ['hallucination', 'fail', 'gone wrong', 'bizarre', 'weird', 'chaos', 'accident', 'unintended', 'lawsuit', 'controversy', 'backlash', 'scandal', 'deepfake', 'misinformation', 'glitch', 'outage', 'meltdown', 'error', 'disaster', 'harm', 'dangerous'] },
]

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'generative', 'chatgpt',
  'openai', 'llm', 'large language model', 'deep learning', 'automation',
  'claude', 'gemini', 'copilot', 'midjourney', 'stable diffusion', 'neural',
  'gpt', 'anthropic', 'agentic', 'prompt', 'deepseek', 'llama', 'mistral',
  'foundation model', 'diffusion model', 'transformer',
]

const T = {
  bg: '#0d0d0d', card: '#141414', border: '#222', orange: '#FF6B35',
  gem: '#38BDF8', submit: '#34D399', blue: '#4A9EFF', violet: '#8B5CF6', text: '#E8E8E8',
  textMuted: '#666', textDim: '#999', red: '#ff4444',
}

const TIER_SCORES = { 1: 30, 2: 20, 3: 10, 4: 5 }
const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${url}`,
]

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}

// Decode HTML entities using a throwaway textarea
function decodeHtmlEntities(str) {
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

// Clean raw RSS description: strip tags, decode entities, remove Reddit boilerplate
function cleanDescription(raw, sourceType) {
  if (!raw) return ''
  let text = raw.replace(/<[^>]*>/g, ' ')
  text = decodeHtmlEntities(text)
  if (sourceType === 'reddit') {
    // Strip "submitted by /u/..." and "[link] [comments]" footer
    text = text.replace(/submitted by\s+\/u\/\S+.*/is, '').trim()
    text = text.replace(/\[link\]|\[comments\]/gi, '').trim()
  }
  return text.replace(/\s+/g, ' ').trim()
}

// Word-boundary AI filter — prevents 'ai' matching 'main', 'said', 'brain', etc.
const AI_REGEXES = AI_KEYWORDS.map((kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'))

function isAIRelated(item) {
  const title = item.title
  return AI_REGEXES.some((re) => re.test(title))
}

function getTopics(item) {
  const text = `${item.title} ${item.description} ${(item.categories || []).join(' ')}`.toLowerCase()
  return TOPICS
    .filter((t) => t.id !== 'all' && t.keywords.some((kw) => text.includes(kw)))
    .map((t) => t.id)
}

function trendingScore(item, allItems) {
  const ageHours = (Date.now() - item.pubDate) / 3600000
  const recency = Math.max(0, 50 - ageHours * 2)
  const source = SOURCES.find((s) => s.name === item.source)
  const tier = source ? TIER_SCORES[source.tier] : 5
  const titleWords = item.title.toLowerCase().split(' ').filter((w) => w.length > 5)
  const crossSource = allItems.filter((other) => {
    if (other.id === item.id || other.source === item.source) return false
    const otherWords = other.title.toLowerCase()
    return titleWords.some((w) => otherWords.includes(w))
  }).length
  const velocity = Math.min(20, crossSource * 7)
  return Math.round(recency + tier + velocity)
}

async function fetchFeed(source) {
  for (let i = 0; i < PROXIES.length; i++) {
    try {
      const res = await fetch(PROXIES[i](source.url))
      const text = await res.text()
      if (!text || text.length < 100) continue
      const xml = new window.DOMParser().parseFromString(text, 'text/xml')
      const items = [...xml.querySelectorAll('item, entry')]
      if (items.length === 0) continue
      return items.slice(0, 10).map((item, idx) => {
        const get = (tag) => item.querySelector(tag)?.textContent?.trim() || ''
        const getAttr = (tag, attr) => item.querySelector(tag)?.getAttribute(attr) || ''
        const title = decodeHtmlEntities(get('title'))
        const link = get('link') || getAttr('link', 'href')
        const pubDate = get('pubDate') || get('published') || get('updated')
        const description = get('description') || get('summary') || get('content')
        const categories = [...item.querySelectorAll('category')].map((c) => c.textContent.trim().toLowerCase())
        return {
          id: `${source.id}-${idx}`,
          title,
          link,
          pubDate: pubDate ? new Date(pubDate).getTime() : Date.now(),
          description: cleanDescription(description, source.type).slice(0, 220),
          source: source.name,
          sourceType: source.type,
          categories,
          topics: [],
          trending: 0,
        }
      }).filter((item) => item.title && item.link)
    } catch (e) {
      continue
    }
  }
  return []
}

// ── SUPABASE ──────────────────────────────────────────────────────────────────
async function fetchGems() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gems?select=article_id`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    const data = await res.json()
    return Array.isArray(data) ? data.map((g) => g.article_id) : []
  } catch (e) { return [] }
}

async function addGem(item) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gems`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ article_id: item.id, title: item.title, link: item.link, source: item.source, gemmed_at: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error(`addGem failed: ${res.status}`)
}

async function removeGem(articleId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gems?article_id=eq.${encodeURIComponent(articleId)}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) throw new Error(`removeGem failed: ${res.status}`)
}

async function fetchHidden() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/hidden?select=article_id`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    const data = await res.json()
    return Array.isArray(data) ? data.map((h) => h.article_id) : []
  } catch (e) { return [] }
}

async function hideArticle(item) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/hidden`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ article_id: item.id, title: item.title, source: item.source, hidden_at: new Date().toISOString() }),
    })
  } catch (e) {}
}

async function fetchWeights() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/weights?select=article_id,weight`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
    const data = await res.json()
    if (!Array.isArray(data)) return {}
    return Object.fromEntries(data.map((r) => [r.article_id, r.weight]))
  } catch (e) { return {} }
}

async function setWeight(articleId, weight) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/weights`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ article_id: articleId, weight, adjusted_at: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error(`setWeight failed: ${res.status}`)
}

async function clearWeight(articleId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/weights?article_id=eq.${encodeURIComponent(articleId)}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) throw new Error(`clearWeight failed: ${res.status}`)
}

async function submitStory({ url, title, note }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ url, title, note }),
  })
  if (!res.ok) throw new Error(`submit failed: ${res.status}`)
}

async function fetchSubmissions() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/submissions?status=eq.pending&order=submitted_at.desc`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

async function updateSubmissionStatus(id, status) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${id}`, {
    method: 'PATCH',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`update failed: ${res.status}`)
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function ScoreBar({ value, color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: T.textMuted, width: 70, letterSpacing: '0.06em', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 3, background: '#252525', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color, width: 28, textAlign: 'right', flexShrink: 0 }}>{value}</span>
    </div>
  )
}

function Ticker({ items }) {
  const [idx, setIdx] = useState(0)
  const top = items.slice(0, 5)
  useEffect(() => {
    if (top.length === 0) return
    const t = setInterval(() => setIdx((i) => (i + 1) % top.length), 4000)
    return () => clearInterval(t)
  }, [top.length])
  if (top.length === 0) return null
  const current = top[idx]
  return (
    <div style={{ borderBottom: `1px solid ${T.border}`, background: '#0a0a0a', padding: '0 32px', height: 36, display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
      <span style={{ background: T.orange, color: '#000', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.1em', flexShrink: 0, fontFamily: "'Outfit', sans-serif" }}>▲ LIVE</span>
      <span style={{ color: T.textMuted, fontSize: 11, flexShrink: 0, fontFamily: "'Outfit', sans-serif" }}>{current.source}</span>
      <span style={{ color: T.textMuted, fontSize: 11 }}>·</span>
      <a href={current.link} target="_blank" rel="noopener noreferrer"
        style={{ color: T.text, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, fontFamily: "'EB Garamond', serif" }}>
        {current.title}
      </a>
      <span style={{ color: T.textMuted, fontSize: 11, flexShrink: 0, fontFamily: "'Outfit', sans-serif" }}>{top.length} trending</span>
    </div>
  )
}

function Card({ item, onToggleGem, onHide, onWeight, isCurator }) {
  const sourceColor = item.sourceType === 'reddit' ? T.orange : item.sourceType === 'substack' ? T.violet : T.blue
  return (
    <div style={{ background: T.card, border: `1px solid ${item.isGem ? T.gem : T.border}`, borderRadius: 8, padding: '20px 24px', marginBottom: 12, transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {item.isGem && (
          <span style={{ background: T.gem, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif" }}><span style={{ fontSize: 8 }}>◆</span> GEM</span>
        )}
        <span style={{ background: '#1a1a1a', color: sourceColor, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, border: `1px solid ${sourceColor}33`, letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif" }}>
          {item.source.toUpperCase()}
        </span>
        <span style={{ marginLeft: 'auto', color: T.textMuted, fontSize: 11, fontFamily: "'Outfit', sans-serif" }}>{timeAgo(item.pubDate)}</span>
      </div>

      <a href={item.link} target="_blank" rel="noopener noreferrer"
        style={{ color: T.text, textDecoration: 'none', fontSize: 19, fontWeight: 400, lineHeight: 1.35, display: 'block', marginBottom: 10, fontFamily: "'EB Garamond', serif" }}>
        {item.title}
      </a>

      {item.description && (
        <p style={{ color: T.textDim, fontSize: 13, lineHeight: 1.6, margin: '0 0 14px', fontFamily: "'Outfit', sans-serif" }}>{item.description}…</p>
      )}

      <ScoreBar value={item.trending} color={T.orange} label="TRENDING" />

      {isCurator && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <button onClick={() => onToggleGem(item)} style={{
            background: item.isGem ? T.gem + '22' : 'transparent',
            border: `1px solid ${item.isGem ? T.gem : T.border}`,
            color: item.isGem ? T.gem : T.textMuted,
            borderRadius: 4, padding: '4px 12px', fontSize: 11, cursor: 'pointer',
            fontWeight: 600, letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif",
          }}>
            {item.isGem ? '◆ MARKED AS GEM' : '◇ MARK AS GEM'}
          </button>
          <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
            <button onClick={() => onWeight(item, 1)} title="Upweight" style={{
              background: item.weight === 1 ? '#22c55e22' : 'transparent',
              border: `1px solid ${item.weight === 1 ? '#22c55e' : T.border}`,
              color: item.weight === 1 ? '#22c55e' : T.textMuted,
              borderRadius: '4px 0 0 4px', padding: '4px 10px', fontSize: 13, cursor: 'pointer', lineHeight: 1,
            }}>▲</button>
            <button onClick={() => onWeight(item, -1)} title="Downweight" style={{
              background: item.weight === -1 ? '#ef444422' : 'transparent',
              border: `1px solid ${item.weight === -1 ? '#ef4444' : T.border}`,
              color: item.weight === -1 ? '#ef4444' : T.textMuted,
              borderRadius: '0 4px 4px 0', padding: '4px 10px', fontSize: 13, cursor: 'pointer', lineHeight: 1,
            }}>▼</button>
          </div>
          <button onClick={() => onHide(item)} style={{
            background: 'transparent', border: `1px solid ${T.border}`,
            color: T.textMuted, borderRadius: 4, padding: '4px 12px', fontSize: 11, cursor: 'pointer',
            fontWeight: 600, letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif",
          }}>✕ HIDE</button>
        </div>
      )}
    </div>
  )
}

function SubmitModal({ onClose }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setStatus('loading')
    try {
      await submitStory({ url: url.trim(), title: title.trim() || null, note: note.trim() || null })
      setStatus('success')
    } catch (e) {
      setStatus('error')
    }
  }

  const inputStyle = {
    background: '#1a1a1a', border: `1px solid ${T.border}`, borderRadius: 4,
    padding: '8px 12px', color: T.text, fontSize: 13, width: '100%',
    fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#141414', border: `1px solid ${T.border}`, borderRadius: 10, padding: 32, width: 460, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ color: T.submit, fontSize: 28, marginBottom: 12 }}>✦</div>
            <p style={{ color: T.text, fontSize: 16, fontWeight: 600, margin: '0 0 8px', fontFamily: "'Outfit', sans-serif" }}>Story submitted!</p>
            <p style={{ color: T.textMuted, fontSize: 13, margin: '0 0 24px', fontFamily: "'Outfit', sans-serif" }}>Thanks — it'll go into the review queue.</p>
            <button onClick={onClose} style={{ background: T.submit, color: '#000', border: 'none', borderRadius: 4, padding: '8px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ color: T.text, fontWeight: 700, fontSize: 16, letterSpacing: '0.04em', fontFamily: "'Outfit', sans-serif" }}>Submit a story</span>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: T.textMuted, fontSize: 11, letterSpacing: '0.08em', display: 'block', marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>URL *</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={inputStyle} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: T.textMuted, fontSize: 11, letterSpacing: '0.08em', display: 'block', marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>Title <span style={{ color: T.textMuted, fontWeight: 400 }}>(optional)</span></label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Leave blank to use page title" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: T.textMuted, fontSize: 11, letterSpacing: '0.08em', display: 'block', marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>Why this? <span style={{ color: T.textMuted, fontWeight: 400 }}>(optional)</span></label>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Briefly explain why it's worth sharing..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {status === 'error' && <p style={{ color: T.red, fontSize: 12, margin: '0 0 16px', fontFamily: "'Outfit', sans-serif" }}>Something went wrong — try again.</p>}
            <button type="submit" disabled={status === 'loading'} style={{
              background: T.submit, color: '#000', border: 'none', borderRadius: 4,
              padding: '9px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", opacity: status === 'loading' ? 0.6 : 1,
            }}>
              {status === 'loading' ? 'Submitting…' : 'Submit story'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function QueueCard({ item, onApprove, onReject }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: '20px 24px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ background: T.submit + '22', color: T.submit, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, border: `1px solid ${T.submit}55`, letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif" }}>✦ TIP</span>
        <span style={{ marginLeft: 'auto', color: T.textMuted, fontSize: 11, fontFamily: "'Outfit', sans-serif" }}>{timeAgo(new Date(item.submitted_at).getTime())}</span>
      </div>
      {item.title && (
        <p style={{ color: T.text, fontSize: 17, fontWeight: 400, lineHeight: 1.35, margin: '0 0 8px', fontFamily: "'EB Garamond', serif" }}>{item.title}</p>
      )}
      <a href={item.url} target="_blank" rel="noopener noreferrer"
        style={{ color: T.blue, fontSize: 12, fontFamily: "'Outfit', sans-serif", wordBreak: 'break-all', display: 'block', marginBottom: item.note ? 10 : 16 }}>
        {item.url}
      </a>
      {item.note && (
        <p style={{ color: T.textDim, fontSize: 13, lineHeight: 1.6, margin: '0 0 16px', fontFamily: "'Outfit', sans-serif", background: '#1a1a1a', padding: '8px 12px', borderRadius: 4, borderLeft: `3px solid ${T.border}` }}>"{item.note}"</p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onApprove(item)} style={{ background: T.submit + '22', border: `1px solid ${T.submit}`, color: T.submit, borderRadius: 4, padding: '5px 16px', fontSize: 11, cursor: 'pointer', fontWeight: 700, letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif" }}>✓ APPROVE</button>
        <button onClick={() => onReject(item)} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 4, padding: '5px 16px', fontSize: 11, cursor: 'pointer', fontWeight: 600, letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif" }}>✕ REJECT</button>
      </div>
    </div>
  )
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [topic, setTopic] = useState('all')
  const [search, setSearch] = useState('')
  const [cacheAge, setCacheAge] = useState(null)
  const [gems, setGems] = useState([])
  const [hidden, setHidden] = useState([])
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [queue, setQueue] = useState([])
  const [queueLoading, setQueueLoading] = useState(false)
  const [weights, setWeights] = useState({})

  const isCurator = new URLSearchParams(window.location.search).get('curator') === 'true'

  useEffect(() => {
    async function load() {
      const [gemIds, hiddenIds, weightMap] = await Promise.all([fetchGems(), fetchHidden(), fetchWeights()])
      setGems(gemIds)
      setHidden(hiddenIds)
      setWeights(weightMap)

      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setItems(cached.items)
          setCacheAge(cached.timestamp)
          setLoading(false)
          return
        }
      } catch (e) {}

      setLoading(true)
      const results = await Promise.allSettled(SOURCES.map(fetchFeed))
      let all = results
        .flatMap((r) => r.status === 'fulfilled' ? r.value : [])
        .filter(isAIRelated)

      all = all.map((item) => ({ ...item, topics: getTopics(item) }))
      all = all.map((item) => ({ ...item, trending: trendingScore(item, all) }))
      all = all.sort((a, b) => b.trending - a.trending)

      setItems(all)
      setLoading(false)

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ items: all, timestamp: Date.now() }))
        setCacheAge(Date.now())
      } catch (e) {}
    }
    load()
  }, [])

  async function toggleGem(item) {
    const isGem = gems.includes(item.id)
    if (isGem) {
      setGems((prev) => prev.filter((g) => g !== item.id))
      try { await removeGem(item.id) }
      catch (e) { console.error(e); setGems((prev) => [...prev, item.id]) }
    } else {
      setGems((prev) => [...prev, item.id])
      try { await addGem(item) }
      catch (e) { console.error(e); setGems((prev) => prev.filter((g) => g !== item.id)) }
    }
  }

  async function handleHide(item) {
    setHidden((prev) => [...prev, item.id])
    await hideArticle(item)
  }

  async function handleWeight(item, direction) {
    const current = weights[item.id]
    if (current === direction) {
      // clicking same direction again clears it
      setWeights((prev) => { const next = { ...prev }; delete next[item.id]; return next })
      await clearWeight(item.id)
    } else {
      setWeights((prev) => ({ ...prev, [item.id]: direction }))
      await setWeight(item.id, direction)
    }
  }

  async function loadQueue() {
    setQueueLoading(true)
    const submissions = await fetchSubmissions()
    setQueue(submissions)
    setQueueLoading(false)
  }

  useEffect(() => {
    if (filter === 'queue' && isCurator) loadQueue()
  }, [filter])

  async function handleApprove(item) {
    setQueue((prev) => prev.filter((s) => s.id !== item.id))
    await updateSubmissionStatus(item.id, 'approved')
  }

  async function handleReject(item) {
    setQueue((prev) => prev.filter((s) => s.id !== item.id))
    await updateSubmissionStatus(item.id, 'rejected')
  }

  function forceRefresh() {
    localStorage.removeItem(CACHE_KEY)
    window.location.reload()
  }

  const WEIGHT_BOOST = 50

  const withMeta = items
    .filter((item) => !hidden.includes(item.id))
    .map((item) => ({
      ...item,
      isGem: gems.includes(item.id),
      weight: weights[item.id] ?? 0,
      adjustedScore: item.trending + (weights[item.id] ?? 0) * WEIGHT_BOOST,
    }))

  const displayed = withMeta
    .filter((item) => filter === 'gems' ? item.isGem : true)
    .filter((item) => topic === 'all' ? true : item.topics.includes(topic))
    .filter((item) => search ? item.title.toLowerCase().includes(search.toLowerCase()) : true)
    .sort((a, b) => b.adjustedScore - a.adjustedScore)

  const topTrending = [...withMeta].sort((a, b) => b.adjustedScore - a.adjustedScore).slice(0, 5)
  const gemCount = gems.length

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: '0 32px', display: 'flex', alignItems: 'center', gap: 24, height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 8 }}>
          <span style={{ background: T.orange, color: '#000', fontWeight: 900, fontSize: 22, letterSpacing: '0.1em', borderRadius: 4, padding: '5px 12px', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>FIREHOSE</span>
          <span style={{ color: T.text, fontSize: 11, letterSpacing: '0.08em', lineHeight: 1.5, whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif" }}>AI intelligence<br />Human-curated</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { id: 'all', label: 'ALL' },
            { id: 'gems', label: `⬡ GEMS${gemCount > 0 ? ` (${gemCount})` : ''}` },
            ...(isCurator ? [{ id: 'queue', label: `✦ QUEUE${queue.length > 0 ? ` (${queue.length})` : ''}` }] : []),
          ].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              background: filter === f.id ? (f.id === 'queue' ? T.submit + '18' : T.orange + '22') : 'transparent',
              border: `1px solid ${filter === f.id ? (f.id === 'queue' ? T.submit : T.orange) : 'transparent'}`,
              color: filter === f.id ? (f.id === 'queue' ? T.submit : T.orange) : T.textMuted,
              borderRadius: 4, padding: '4px 16px', fontSize: 13, cursor: 'pointer',
              fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: "'Outfit', sans-serif",
            }}>
              {f.label}
            </button>
          ))}
        </div>

        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search feeds..."
          style={{
            background: '#1a1a1a', border: `1px solid ${T.border}`,
            borderRadius: 4, padding: '6px 14px', color: T.text, fontSize: 13,
            outline: 'none', width: 220, fontFamily: "'Outfit', sans-serif",
          }} />

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {cacheAge && <span style={{ color: T.textMuted, fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>Updated {timeAgo(cacheAge)}</span>}
          <button onClick={forceRefresh} style={{
            background: 'transparent', border: `1px solid ${T.border}`,
            color: T.textMuted, borderRadius: 4, padding: '4px 12px',
            fontSize: 12, cursor: 'pointer', letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif",
          }}>↺ REFRESH</button>
          <button onClick={() => setShowSubmitModal(true)} style={{
            background: T.submit + '18', color: T.submit, border: `1px solid ${T.submit}`,
            borderRadius: 4, padding: '5px 14px',
            fontSize: 12, cursor: 'pointer', fontWeight: 700, letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif",
          }}>✦ SUBMIT</button>
        </div>
      </div>

      {/* TICKER */}
      <Ticker items={topTrending} />

      <div style={{ display: 'flex' }}>

        {/* SIDEBAR */}
        <div style={{ width: 220, borderRight: `1px solid ${T.border}`, padding: '24px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: '0.1em', marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>TOPICS</div>
          {TOPICS.map((t) => {
            const count = t.id === 'all'
              ? withMeta.filter((i) => filter === 'gems' ? i.isGem : true).length
              : withMeta.filter((i) => i.topics.includes(t.id) && (filter === 'gems' ? i.isGem : true)).length
            const isRogue = t.id === 'rogue-ai'
            return (
              <div key={t.id} onClick={() => setTopic(t.id)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', borderRadius: 4, cursor: 'pointer', marginBottom: 2,
                background: topic === t.id ? T.orange + '18' : 'transparent',
                color: topic === t.id ? T.orange : isRogue ? T.red : T.textDim,
                fontSize: 13, fontFamily: "'Outfit', sans-serif",
              }}>
                <span>{isRogue ? '⚡ ' : ''}{t.label}</span>
                <span style={{ fontSize: 11, color: T.textMuted }}>{count}</span>
              </div>
            )
          })}

          <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: '0.1em', margin: '24px 0 12px', fontFamily: "'Outfit', sans-serif" }}>FEED STATS</div>
          <div style={{ fontSize: 12, color: T.textDim, lineHeight: 2.2, fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>In feed</span>
              <span style={{ color: T.text, fontWeight: 600 }}>{withMeta.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gems</span>
              <span style={{ color: T.gem, fontWeight: 600 }}><span style={{ fontSize: 10 }}>◆</span> {gemCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Hidden</span>
              <span style={{ color: T.textMuted, fontWeight: 600 }}>{hidden.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sources</span>
              <span style={{ color: T.text, fontWeight: 600 }}>{SOURCES.length}</span>
            </div>
          </div>
        </div>

        {/* FEED */}
        <div style={{ flex: 1, padding: '24px 32px', maxWidth: 820 }}>
          {filter === 'queue' ? (
            <>
              <div style={{ color: T.textMuted, fontSize: 10, letterSpacing: '0.1em', marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>SUBMITTED STORIES</div>
              {queueLoading && <div style={{ color: T.textMuted, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}><span style={{ color: T.orange }}>●</span> Loading queue…</div>}
              {!queueLoading && queue.length === 0 && <div style={{ color: T.textMuted, fontSize: 14, textAlign: 'center', marginTop: 60, fontFamily: "'Outfit', sans-serif" }}>Queue is empty.</div>}
              {queue.map((item) => <QueueCard key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} />)}
            </>
          ) : (
            <>
              {loading && (
                <div style={{ color: T.textMuted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Outfit', sans-serif" }}>
                  <span style={{ color: T.orange }}>●</span> Loading all sources…
                </div>
              )}
              {!loading && displayed.length === 0 && (
                <div style={{ color: T.textMuted, fontSize: 14, textAlign: 'center', marginTop: 60, fontFamily: "'Outfit', sans-serif" }}>
                  {filter === 'gems' ? 'No gems yet.' : 'No articles found.'}
                </div>
              )}
              {displayed.map((item) => (
                <Card key={item.id} item={item} onToggleGem={toggleGem} onHide={handleHide} onWeight={handleWeight} isCurator={isCurator} />
              ))}
            </>
          )}
        </div>
      </div>

      {showSubmitModal && <SubmitModal onClose={() => setShowSubmitModal(false)} />}
    </div>
  )
}