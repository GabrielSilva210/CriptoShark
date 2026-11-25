

const MAX_ITEMS = 6

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

const decode = (s = '') =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, e) => ENTITIES[e])

const stripHtml = (s) => decode(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return m ? m[1] : ''
}

function parseFeed(xml) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || []
  return blocks.flatMap((item) => {
    const rawTitle = stripHtml(tag(item, 'title'))
    const url = stripHtml(tag(item, 'link'))
    const time = Date.parse(stripHtml(tag(item, 'pubDate')))
    const source = stripHtml(tag(item, 'source'))
    if (!rawTitle || !/^https?:\/\//i.test(url) || Number.isNaN(time)) return []

    // O Google News coloca " - Fonte" no fim do título; removemos pra não duplicar.
    const title = source && rawTitle.endsWith(` - ${source}`)
      ? rawTitle.slice(0, -(source.length + 3))
      : rawTitle

    return [{ id: url, title, url, source, publishedAt: new Date(time).toISOString() }]
  })
}

export default async function handler(req, res) {
  const name = String(req.query.name || '').trim().slice(0, 60)
  if (!name) return res.status(400).json({ error: 'Parâmetro "name" obrigatório', items: [] })

  // Nome entre aspas + contexto cripto evita misturar com notícias de outros assuntos.
  const q = `"${name}" (cripto OR crypto OR token) when:30d`
  const url =
    'https://news.google.com/rss/search?' +
    new URLSearchParams({ q, hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419' })

  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CriptoDash/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
      },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)

    const seen = new Set()
    const items = parseFeed(await r.text())
      .filter((n) => (seen.has(n.title) ? false : seen.add(n.title)))
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, MAX_ITEMS)

    // Cache na CDN por 15 min: poucas buscas servem todos os visitantes da moeda.
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    return res.status(200).json({ updatedAt: new Date().toISOString(), items })
  } catch (err) {
    console.error('[coin-news] falhou:', err.message)
    return res.status(502).json({ error: 'Não foi possível carregar as notícias', items: [] })
  }
}
