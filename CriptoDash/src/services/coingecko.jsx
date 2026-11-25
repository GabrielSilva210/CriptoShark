const BASE_URL = 'http://localhost:8080/api/cg'

  const CACHE_TTL = 60_000
  const cache = new Map()

  function request(path) {
    const cached = cache.get(path)
    if (cached && Date.now() - cached.time < CACHE_TTL) return cached.promise

    const promise = fetchJson(path).catch((err) => {
      cache.delete(path) 
      throw err
    })

    cache.set(path, { time: Date.now(), promise })
    return promise
  }

  async function fetchJson(path) {
    let response

    try {
      response = await fetch(`${BASE_URL}${path}`)
    } catch {

      throw new Error(
        'Não foi possível conectar à CoinGecko. Pode ser o limite de requisições: aguarde 1 minuto e tente de novo.',
      )
    }

    if (response.status === 429) {
      throw new Error('Muitas requisições. Aguarde um minuto e tente de novo.')
    }

    if (!response.ok) {
      throw new Error('Erro ao buscar dados da CoinGecko.')
    }

    return response.json()
  }

  export async function searchCoins(query) {
    const data = await request(`/search?query=${encodeURIComponent(query)}`)
    return data.coins
  }

  export async function getGlobalData() {
    const data = await request('/global')
    return data.data
  }

  export const CURRENCY = 'usd'

  export async function getCoinDetails(id) {
    return request(
      `/coins/${encodeURIComponent(id)}?localization=true&tickers=false&community_data=false&developer_data=false`,
    )
  }

  export async function getCoinOhlc(id, days) {
    return request(
      `/coins/${encodeURIComponent(id)}/ohlc?vs_currency=${CURRENCY}&days=${days}`,
    )
  }

  export async function getCoinMarketChart(id, days) {
    return request(
      `/coins/${encodeURIComponent(id)}/market_chart?vs_currency=${CURRENCY}&days=${days}`,
    )
  }

  export async function getCoinsMarkets(ids) {
    const list = ids.map(encodeURIComponent).join(',')
    return request(
      `/coins/markets?vs_currency=${CURRENCY}&ids=${list}&order=market_cap_desc&per_page=250&price_change_percentage=24h`,
    )
  }
  export async function getTopMarketsBrl() {
    return request(
      '/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d',
    )
  }