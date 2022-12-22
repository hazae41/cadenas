import { Transport } from "mods/transports/transport.js"

export class HttpTransport extends EventTarget implements Transport {
  readonly #class = HttpTransport

  constructor(
    readonly info: RequestInfo
  ) {
    super()

    setTimeout(() => {
      this.fetch()
    }, 1000)
  }

  private async fetch(body?: Buffer) {
    const res = await fetch(this.info, { method: "POST", body })
    const data = Buffer.from(await res.arrayBuffer())
    this.dispatchEvent(new MessageEvent("message", { data }))
  }

  async send(data: Buffer) {
    console.log("->", data)
    await this.fetch(data)
  }
}
