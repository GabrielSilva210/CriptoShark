
export default function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      console.log('[dev-api] ativo: servindo /api/* a partir da pasta /api')
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.replace(/^\//, '')
        if (!/^[a-z0-9-]+$/i.test(name)) return next() // evita path traversal

        let mod
        try {
          mod = await server.ssrLoadModule(`/api/${name}.js`)
        } catch (err) {
          console.error(`[dev-api] não consegui carregar /api/${name}.js:`, err.message)
          return next()
        }

        // Adapta req/res do Node pro formato que a Vercel usa
        req.query = Object.fromEntries(url.searchParams)
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }

        try {
          await mod.default(req, res)
        } catch (err) {
          console.error(`[dev-api] ${name}:`, err)
          res.status(500).json({ error: 'Erro interno', items: [] })
        }
      })
    },
  }
}