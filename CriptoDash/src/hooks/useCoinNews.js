import { useState, useEffect } from 'react'

// Cache simples em memória por moeda (evita refetch ao voltar pra mesma moeda)
const cache = new Map()

export function useCoinNews(name) {
  const [items, setItems] = useState(() => cache.get(name) || [])
  const [loading, setLoading] = useState(!cache.has(name))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!name) return
    if (cache.has(name)) {
      setItems(cache.get(name))
      setLoading(false)
      return
    }

    let ignore = false
    setLoading(true)
    setError(null)
    setItems([])

    fetch(`/api/coin-news?name=${encodeURIComponent(name)}`)
      .then((r) => {
        const isJson = r.headers.get('content-type')?.includes('application/json')
        if (!isJson) {
          throw new Error(
            'A rota /api/coin-news não está sendo servida (plugin dev-api ativo? ou use vercel dev).',
          )
        }
        if (!r.ok) {
          throw new Error(`Falha ao buscar notícias no servidor (HTTP ${r.status}). Veja o terminal.`)
        }
        return r.json()
      })
      .then((data) => {
        cache.set(name, data.items || [])
        if (!ignore) setItems(data.items || [])
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [name])

  return { items, loading, error }
}