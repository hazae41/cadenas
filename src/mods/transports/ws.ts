import { Tls } from "mods/tls.js"

export class TlsOverWebSocket extends Tls {
  readonly class = TlsOverWebSocket

  constructor(
    readonly socket: WebSocket
  ) {
    super()

    socket.addEventListener("message", async e => {
      this.onData(Buffer.from(await e.data.arrayBuffer()))
    }, { passive: true })
  }

  async sendRaw(buffer: Buffer) {
    console.log("->", buffer)
    this.socket.send(buffer)
  }

  private async onData(buffer: Buffer) {
    console.log("<-", buffer)
  }
}