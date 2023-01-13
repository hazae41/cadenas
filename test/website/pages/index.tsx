import { BatchedFetchStream, Ciphers, Tls, WebSocketStream } from "@hazae41/cadenas"
import { fetch } from "@hazae41/fleche"
import { useCallback } from "react"

async function createWebSocketStream() {
  const websocket = new WebSocket("ws://localhost:8080")

  websocket.binaryType = "arraybuffer"

  await new Promise((ok, err) => {
    websocket.addEventListener("open", ok)
    websocket.addEventListener("error", err)
  })

  return new WebSocketStream(websocket)
}

async function createHttpStream() {
  const headers = { "x-session-id": crypto.randomUUID() }
  const request = new Request("https://meek.bamsoftware.com/", { headers })

  return new BatchedFetchStream(request)
}

export default function Home() {

  const onClick = useCallback(async () => {
    const ws = await createHttpStream()

    const ciphers = [Ciphers.TLS_DHE_RSA_WITH_AES_256_CBC_SHA]

    const tls = new Tls(ws, { ciphers })

    await tls.handshake()

    const res = await fetch("http://localhost/", { stream: tls })

    console.log(res)
    console.log(await res.text())
  }, [])

  return <button onClick={onClick}>
    Click me
  </button>
}
