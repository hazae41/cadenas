import { TlsOverHttp, TlsOverWebSocket } from "@hazae41/telsa"
import { useCallback } from "react"

async function ws() {
  const ws = new WebSocket("ws://localhost:8080")

  await new Promise((ok, err) => {
    ws.addEventListener("open", ok)
    ws.addEventListener("error", err)
  })

  return new TlsOverWebSocket(ws)
}

async function http() {
  const headers = { "x-session-id": crypto.randomUUID() }
  const request = new Request("https://meek.bamsoftware.com/", { headers })

  return new TlsOverHttp(request)
}

export default function Home() {

  const onClick = useCallback(async () => {
    const tls = await ws()
    await tls.handshake()
  }, [])

  return <button onClick={onClick}>
    Click me
  </button>
}
