import { TlsOverHttp } from "@hazae41/telsa"
import { useCallback } from "react"

export default function Home() {

  const onClick = useCallback(async () => {
    const headers = { "x-session-id": crypto.randomUUID() }
    const request = new Request("https://meek.bamsoftware.com/", { headers })

    const tls = new TlsOverHttp(request)
    await tls.handshake()
  }, [])

  return <button onClick={onClick}>
    Click me
  </button>
}
