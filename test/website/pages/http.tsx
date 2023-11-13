import { Opaque, Writable } from "@hazae41/binary"
import { Ciphers, TlsClientDuplex } from "@hazae41/cadenas"
import { fetch } from "@hazae41/fleche"
import { Mutex } from "@hazae41/mutex"
import { useCallback, useEffect, useMemo, useState } from "react"
import { WebSocketStream, createWebSocketStream } from "../src/transports/websocket"

async function createTlsStream(tcp: ReadableWritablePair<Opaque, Writable>) {
  const ciphers = [
    // Ciphers.TLS_DHE_RSA_WITH_AES_128_CBC_SHA,
    // Ciphers.TLS_DHE_RSA_WITH_AES_128_CBC_SHA256,
    // Ciphers.TLS_DHE_RSA_WITH_AES_128_GCM_SHA256,
    // Ciphers.TLS_DHE_RSA_WITH_AES_256_CBC_SHA,
    // Ciphers.TLS_DHE_RSA_WITH_AES_256_CBC_SHA256,
    // Ciphers.TLS_DHE_RSA_WITH_AES_256_GCM_SHA384,
    Ciphers.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
  ]

  const tls = new TlsClientDuplex({ host_name: "twitter.com", ciphers })

  tcp.readable
    .pipeTo(tls.inner.writable, {})
    .catch(console.error)

  tls.inner.readable
    .pipeTo(tcp.writable, {})
    .catch(console.error)

  return tls
}

export default function Home() {
  const [tcp, setTcp] = useState<WebSocketStream>()

  useEffect(() => {
    createWebSocketStream("ws://localhost:8080").then(setTcp)
  }, [])

  const [tls, setTls] = useState<TlsClientDuplex>()

  useEffect(() => {
    if (tcp == null)
      return
    createTlsStream(tcp).then(setTls)
  }, [tcp])

  const mutex = useMemo(() => {
    if (tls == null)
      return
    return new Mutex(tls)
  }, [tls])

  const onClick = useCallback(async () => {
    try {
      if (mutex == null)
        return
      await mutex.lock(async tls => {
        const start = Date.now()
        const res = await fetch("https://twitter.com", { stream: tls.outer, preventAbort: true, preventCancel: true, preventClose: true })
        console.log(Date.now() - start, "ms")
        console.log(res.status, res.statusText)
        const text = await res.text()
        console.log(Date.now() - start, "ms")
        console.log(text)
      })
    } catch (e: unknown) {
      console.error("onClick", { e })
    }
  }, [mutex])

  return <button onClick={onClick}>
    Click me
  </button>
}
