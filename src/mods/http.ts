import { ClientHello } from "mods/binary/client_hello.js"

export class TlsOverHttp {
  readonly class = TlsOverHttp

  constructor(
    readonly info: RequestInfo
  ) { }

  async fetch(body?: Buffer) {
    const res = await fetch(this.info, { method: "POST", body })
    this.onData(Buffer.from(await res.arrayBuffer()))
  }

  async handshake() {
    const hello = new ClientHello()
    await this.fetch(hello.export().buffer)
  }

  private async onData(buffer: Buffer) {

  }

}