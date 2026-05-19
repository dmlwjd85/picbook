/** PicBook 계정·연출 클라우드 동기화 (Cloudflare Workers KV) */

export interface Env {
  ACCOUNTS: KVNamespace
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors })
    }

    const url = new URL(request.url)
    const match = url.pathname.match(/^\/account\/([a-f0-9]{64})$/)
    if (!match) {
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: cors })
    }

    const id = match[1]!

    if (request.method === 'GET') {
      const raw = await env.ACCOUNTS.get(id)
      if (!raw) {
        return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: cors })
      }
      return new Response(raw, {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    if (request.method === 'PUT') {
      const body = await request.text()
      if (!body || body.length > 512_000) {
        return new Response(JSON.stringify({ error: 'payload too large' }), { status: 413, headers: cors })
      }
      await env.ACCOUNTS.put(id, body)
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'method' }), { status: 405, headers: cors })
  },
}
