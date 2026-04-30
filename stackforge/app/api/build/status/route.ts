import { NextRequest } from 'next/server'
import { buildStore } from '@/lib/buildStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<Response> {
  const buildId = request.nextUrl.searchParams.get('buildId')
  if (!buildId) return new Response('Missing buildId', { status: 400 })

  let cursor = 0

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
      }

      const tick = () => {
        const entry = buildStore.get(buildId)
        if (!entry) {
          send(JSON.stringify({ type: 'error', message: 'Build not found' }))
          controller.close()
          return
        }

        while (cursor < entry.logs.length) {
          send(JSON.stringify({ type: 'log', log: entry.logs[cursor] }))
          cursor++
        }

        if (entry.status === 'done') {
          send(JSON.stringify({ type: 'done', outputs: entry.outputs }))
          controller.close()
          return
        }

        if (entry.status === 'error') {
          send(JSON.stringify({ type: 'error', message: entry.error ?? 'Build failed' }))
          controller.close()
          return
        }

        setTimeout(tick, 500)
      }

      tick()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
