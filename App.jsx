import { useState, useEffect } from 'react'

// ── FONTS ─────────────────────────────────────────────────────────────────────
const fontLink = document.createElement('link')
fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=EB+Garamond:wght@400;600&display=swap'
fontLink.rel = 'stylesheet'
document.head.appendChild(fontLink)

// ── CONFIG ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://dgzzwgfpbnzyccfakobw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_u_n3MB-ozI8LgNJeS1IR6Q_5GQtv5ts'
const CACHE_KEY = 'firehose-cache-v3'
const CACHE_TTL = 60 * 60 * 1000

// ── SOURCES ───────────────────────────────────────────────────────────────────
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

// ── TOPICS ────────────────────────────────────────────────────────────────────
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

// ── AI FILTER ─────────────────────────────────────────────────────────────────
const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'generative', 'chatgpt',
  'openai', 'llm', 'large language model', 'deep learning', 'automation',
  'claude', 'gemini', 'copilot', 'midjourney', 'stable diffusion', 'neural',
  'gpt', 'anthropic', 'agentic', 'prompt', 'deepseek', 'llama', 'mistral',
  'foundation model', 'diffusion model', 'transformer',
]

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  bg: '#0d0d0d', card: '#141414', border: '#222', orange: '#FF6B35',
  yellow: '#FFD700', blue: '#4A9EFF', violet: '#8B5CF6', text: '#E8E8E8',
  textMuted: '#666', textDim: '#999',
}

const TIER_SCORES = { 1: 30, 2: 20, 3: 10, 4: 5 }

const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${url}`,
]

// ── UTILS ─────────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}

function isAIRelated(item) {
  const text = `${item.title} ${item.description}`.toLowerCase()
  return AI_KEYWORDS.some((kw) => text.includes(kw))
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

// ── FETCH ─────────────────────────────────────────────────────────────────────
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
        const title = get('title')
        const link = get('link') || getAttr('link', 'href')
        const pubDate = get('pubDate') || get('published') || get('updated')
        const description = get('description') || get('summary') || get('content')
        const categories = [...item.querySelectorAll('category')].map((c) => c.textContent.trim().toLowerCase())
        return {
          id: `${source.id}-${idx}`,
          title,
          link,
          pubDate: pubDate ? new Date(pubDate).getTime() : Date.now(),
          description: description.replace(/<[^>]*>/g, '').slice(0, 220),
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
  } catch (e) {
    return []
  }
}

async function addGem(item) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/gems`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        article_id: item.id,
        title: item.title,
        link: item.link,
        source: item.source,
        gemmed_at: new Date().toISOString(),
      }),
    })
  } catch (e) {}
}

async function removeGem(articleId) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/gems?article_id=eq.${encodeURIComponent(articleId)}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
  } catch (e) {}
}

// ── SCORE BAR ─────────────────────────────────────────────────────────────────
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

// ── TICKER ────────────────────────────────────────────────────────────────────
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
    <div style={{
      borderBottom: `1px solid ${T.border}`, background: '#0a0a0a',
      padding: '0 32px', height: 36, display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden',
    }}>
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

// ── CARD ──────────────────────────────────────────────────────────────────────
function Card({ item, onToggleGem, isCurator }) {
  const sourceColor = item.sourceType === 'reddit' ? T.orange
    : item.sourceType === 'substack' ? T.violet : T.blue

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${item.isGem ? T.yellow : T.border}`,
      borderRadius: 8, padding: '20px 24px', marginBottom: 12,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {item.isGem && (
          <span style={{ background: T.yellow, color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.08em', fontFamily: "'Outfit', sans-serif" }}>◆ GEM</span>
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
        <button onClick={() => onToggleGem(item)} style={{
          marginTop: 12,
          background: item.isGem ? T.yellow + '22' : 'transparent',
          border: `1px solid ${item.isGem ? T.yellow : T.border}`,
          color: item.isGem ? T.yellow : T.textMuted,
          borderRadius: 4, padding: '4px 12px', fontSize: 11, cursor: 'pointer',
          fontWeight: 600, letterSpacing: '0.06em', fontFamily: "'Outfit', sans-serif",
        }}>
          {item.isGem ? '◆ MARKED AS GEM' : '◇ MARK AS GEM'}
        </button>
      )}
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

  const isCurator = new URLSearchParams(window.location.search).get('curator') === 'true'

  useEffect(() => {
    async function load() {
      const gemIds = await fetchGems()
      setGems(gemIds)

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
      await removeGem(item.id)
    } else {
      setGems((prev) => [...prev, item.id])
      await addGem(item)
    }
  }

  function forceRefresh() {
    localStorage.removeItem(CACHE_KEY)
    window.location.reload()
  }

  const withGems = items.map((item) => ({ ...item, isGem: gems.includes(item.id) }))

  const displayed = withGems
    .filter((item) => filter === 'gems' ? item.isGem : true)
    .filter((item) => topic === 'all' ? true : item.topics.includes(topic))
    .filter((item) => search ? item.title.toLowerCase().includes(search.toLowerCase()) : true)

  const topTrending = [...withGems].sort((a, b) => b.trending - a.trending).slice(0, 5)
  const gemCount = gems.length

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: '0 32px', display: 'flex', alignItems: 'center', gap: 24, height: 60 }}>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0, marginRight: 8 }}>
          <span style={{ color: T.orange, fontWeight: 900, fontSize: 22, letterSpacing: '0.08em', lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>FIREHOSE</span>
          <span style={{ color: T.textMuted, fontSize: 9, letterSpacing: '0.1em', lineHeight: 1.4, whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif" }}>AI intelligence. Human-curated.</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'gems'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? T.orange + '22' : 'transparent',
              border: `1px solid ${filter === f ? T.orange : 'transparent'}`,
              color: filter === f ? T.orange : T.textMuted,
              borderRadius: 4, padding: '4px 16px', fontSize: 12, cursor: 'pointer',
              fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: "'Outfit', sans-serif",
            }}>
              {f === 'gems' ? `◆ GEMS${gemCount > 0 ? ` (${gemCount})` : ''}` : 'ALL'}
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
          {cacheAge && <span style={{ color: T.textMuted, fontSize: 11, fontFamily: "'Outfit', sans-serif" }}>Updated {timeAgo(cacheAge)}</span>}
          <button onClick={forceRefresh} style={{
            background: 'transparent', border: `1px solid ${T.border}`,
            color: T.textMuted, borderRadius: 4, padding: '4px 12px',
            fontSize: 11, cursor: 'pointer', letterSpacing: '0.06em',
            fontFamily: "'Outfit', sans-serif",
          }}>↺ REFRESH</button>
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
              ? withGems.filter((i) => filter === 'gems' ? i.isGem : true).length
              : withGems.filter((i) => i.topics.includes(t.id) && (filter === 'gems' ? i.isGem : true)).length
            const isRogue = t.id === 'rogue-ai'
            return (
              <div key={t.id} onClick={() => setTopic(t.id)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', borderRadius: 4, cursor: 'pointer', marginBottom: 2,
                background: topic === t.id ? T.orange + '18' : 'transparent',
                color: topic === t.id ? T.orange : isRogue ? '#ff4444' : T.textDim,
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
              <span style={{ color: T.text, fontWeight: 600 }}>{items.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gems</span>
              <span style={{ color: T.yellow, fontWeight: 600 }}>◆ {gemCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sources</span>
              <span style={{ color: T.text, fontWeight: 600 }}>{SOURCES.length}</span>
            </div>
          </div>
        </div>

        {/* FEED */}
        <div style={{ flex: 1, padding: '24px 32px', maxWidth: 820 }}>
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
            <Card key={item.id} item={item} onToggleGem={toggleGem} isCurator={isCurator} />
          ))}
        </div>
      </div>
    </div>
  )
}
