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

  private async fetch(body?: Uint8Array) {
    const res = await fetch(this.info, { method: "POST", body })
    const data = new Uint8Array(await res.arrayBuffer())
    this.dispatchEvent(new MessageEvent("message", { data }))
  }

  async send(data: Uint8Array) {
    console.log("->", data)
    await this.fetch(data)
  }
}
