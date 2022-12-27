import { HttpTransport, Tls, TLS_DHE_RSA_WITH_AES_256_CBC_SHA, WebSocketTransport } from "@hazae41/telsa"
import { useCallback } from "react"

async function ws() {
  const ws = new WebSocket("ws://localhost:8080")

  await new Promise((ok, err) => {
    ws.addEventListener("open", ok)
    ws.addEventListener("error", err)
  })

  return new WebSocketTransport(ws)
}

async function http() {
  const headers = { "x-session-id": crypto.randomUUID() }
  const request = new Request("https://meek.bamsoftware.com/", { headers })

  return new HttpTransport(request)
}

export default function Home() {

  const onClick = useCallback(async () => {
    const transport = await http()

    const tls = new Tls(transport, [
      TLS_DHE_RSA_WITH_AES_256_CBC_SHA,
      // TLS_DHE_RSA_WITH_AES_128_CBC_SHA,
      // TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA
    ])

    await tls.handshake()
  }, [])

  return <button onClick={onClick}>
    Click me
  </button>
}
