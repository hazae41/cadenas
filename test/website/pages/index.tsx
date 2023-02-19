import { Ciphers, TlsStream, WebSocketStream } from "@hazae41/cadenas"
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

export default function Home() {

  const onClick = useCallback(async () => {
    try {
      const tcp = await createWebSocketStream()

      const ciphers = [
        // Ciphers.TLS_DHE_RSA_WITH_AES_128_CBC_SHA,
        // Ciphers.TLS_DHE_RSA_WITH_AES_128_CBC_SHA256,
        // Ciphers.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256,
        // Ciphers.TLS_DHE_RSA_WITH_AES_256_CBC_SHA,
        // Ciphers.TLS_DHE_RSA_WITH_AES_256_CBC_SHA256,
        // Ciphers.TLS_DHE_RSA_WITH_AES_256_GCM_SHA384,
        Ciphers.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
      ]

      const tls = new TlsStream(tcp, { ciphers })

      // const headers = new Headers({ "Content-Type": "application/json" })
      // const body = JSON.stringify({ "jsonrpc": "2.0", "method": "web3_clientVersion", "params": [], "id": 67 })
      // const res = await fetch("https://eth.llamarpc.com", { stream: tls, method: "POST", headers, body })

      const res = await fetch("https://twitter.com", { stream: tls })

      console.log(res)
      const text = await res.text()
      console.log(text)

      // const ws = new Fleche.WebSocket("wss://example.com", undefined, { stream: tls })

      // await new Promise((ok, err) => {
      //   ws.addEventListener("open", ok)
      //   ws.addEventListener("close", err)
      //   ws.addEventListener("error", err)
      // })

      // ws.send(`{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":67}`)

      // const event = await new Promise((ok, err) => {
      //   ws.addEventListener("message", ok)
      //   ws.addEventListener("error", err)
      //   ws.addEventListener("close", err)
      // })

      // const msgEvent = event as MessageEvent<string>
      // console.log(msgEvent.data)
    } catch (e: unknown) {
      console.error(e)
    }
  }, [])

  return <button onClick={onClick}>
    Click me
  </button>
}
