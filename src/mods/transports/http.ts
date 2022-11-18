import { Tls } from "mods/tls.js"

export class TlsOverHttp extends Tls {
  readonly class = TlsOverHttp

  constructor(
    readonly info: RequestInfo
  ) {
    super()
  }

  private async fetch(body?: Buffer) {
    const res = await fetch(this.info, { method: "POST", body })
    this.onData(Buffer.from(await res.arrayBuffer()))
  }

  protected async sendRaw(buffer: Buffer) {
    console.log("->", buffer)
    return await this.fetch(buffer)
  }

  private async onData(buffer: Buffer) {
    console.log("<-", buffer)
  }
}