import { Transport } from "mods/transports/transport.js"

export class WebSocketTransport extends EventTarget implements Transport {
  readonly #class = WebSocketTransport

  constructor(
    readonly socket: WebSocket
  ) {
    super()

    socket.addEventListener("message", async (e: MessageEvent<Blob>) => {
      const data = new Uint8Array(await e.data.arrayBuffer())
      this.dispatchEvent(new MessageEvent("message", { data }))
    }, { passive: true })
  }

  send(data: Uint8Array) {
    console.log("->", data)
    this.socket.send(data)
  }
}
