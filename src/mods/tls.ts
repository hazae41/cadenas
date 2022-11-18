import { ClientHello } from "mods/binary/handshakes/client_hello/handshake.js"
import { Transport } from "mods/transports/transport.js"

export abstract class Tls {

  constructor(
    readonly transport: Transport
  ) {
    transport.addEventListener("message", async (e) => {
      const message = e as MessageEvent<Buffer>
      this.onData(message.data)
    }, { passive: true })
  }

  async handshake() {
    const hello = ClientHello.default3()
      .handshake()
      .record(0x0303)
      .export()
    await this.transport.send(hello.buffer)
  }

  async onData(data: Buffer) {
    console.log("<-", data)
  }
}