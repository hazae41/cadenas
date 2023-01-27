import { BatchedFetchStream, Ciphers, TlsStream, WebSocketStream } from "@hazae41/cadenas"
import { fetch } from "@hazae41/fleche"
import { useCallback } from "react"

async function createWebSocketStream() {
  const websocket = new WebSocket("ws://localhost:8080")

  websocket.binaryType = "arraybuffer"

  await new Promise((ok, err) => {
    websocket.addEventListener("open", ok)
    websocket.addEventListener("error", err)
  })

  await new Promise(ok => setTimeout(ok, 100))
  return new WebSocketStream(websocket)
}

async function createHttpStream() {
  const headers = { "x-session-id": crypto.randomUUID() }
  const request = new Request("https://meek.bamsoftware.com/", { headers })

  return new BatchedFetchStream(request, { highDelay: 100 })
}

export default function Home() {

  const onClick = useCallback(async () => {
    const ws = await createWebSocketStream()

    const ciphers = [Ciphers.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256]

    const tls = new TlsStream(ws, { ciphers })

    await tls.handshake()

    const res = await fetch("https://localhost/", { stream: tls })
    // console.log(res.status)
    // const text = await res.text()
    // console.log(text.length)
  }, [])

  return <button onClick={onClick}>
    Click me
  </button>
}
