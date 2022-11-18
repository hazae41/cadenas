import { ClientHello } from "mods/binary/handshakes/client_hello/handshake.js"

export abstract class Tls {
  protected abstract sendRaw(buffer: Buffer): Promise<void>

  async handshake() {
    const hello = ClientHello.default3()
      .handshake()
      .record(0x0303)
      .export()
    await this.sendRaw(hello.buffer)
  }
}