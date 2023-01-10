import { Ciphers, Tls, WebSocketStream } from "@hazae41/telsa"
import { useCallback } from "react"

async function ws() {
  const ws = new WebSocket("ws://localhost:8080")

  await new Promise((ok, err) => {
    ws.addEventListener("open", ok)
    ws.addEventListener("error", err)
  })

  return new WebSocketStream(ws)
}

// async function http() {
//   const headers = { "x-session-id": crypto.randomUUID() }
//   const request = new Request("https://meek.bamsoftware.com/", { headers })

//   return new HttpTransport(request)
// }

export default function Home() {

  const onClick = useCallback(async () => {
    const stream = await ws()

    const ciphers = [
      Ciphers.TLS_DHE_RSA_WITH_AES_256_CBC_SHA,
      // TLS_DHE_RSA_WITH_AES_128_CBC_SHA,
      // TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA
    ]

    const tls = new Tls(stream, { ciphers })

    await tls.handshake()
  }, [])

  return <button onClick={onClick}>
    Click me
  </button>
}
