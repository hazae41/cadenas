import { Binary } from "libs/binary.js"
import { Alert } from "mods/binary/alerts/alert.js"
import { ClientHello2 } from "mods/binary/handshakes/client_hello/handshake2.js"
import { Handshake, HandshakeHeader } from "mods/binary/handshakes/handshake.js"
import { ServerHello2 } from "mods/binary/handshakes/server_hello/handshake2.js"
import { RecordHeader } from "mods/binary/record/record.js"
import { Transport } from "mods/transports/transport.js"

export class Tls {

  constructor(
    readonly transport: Transport,
    readonly ciphers: number[]
  ) {
    transport.addEventListener("message", async (e) => {
      const message = e as MessageEvent<Buffer>
      this.onData(message.data)
    }, { passive: true })
  }

  async handshake() {
    const hello = ClientHello2
      .default(this.ciphers)
      .handshake()
      .record(0x0301)
      .export()
    await this.transport.send(hello.buffer)
  }

  private async onData(data: Buffer) {
    console.log("<-", data)
    this.onRecord(new Binary(data))
  }

  private async onRecord(binary: Binary) {
    const record = RecordHeader.read(binary)

    if (record.type === Alert.type)
      return this.onAlert(binary, record.length)
    if (record.type === Handshake.type)
      return this.onHandshake(binary, record.length)

    console.warn(record)
  }

  private async onAlert(binary: Binary, length: number) {
    const alert = Alert.read(binary, length)

    console.log(alert)
  }

  private async onHandshake(binary: Binary, length: number) {
    const handshake = HandshakeHeader.read(binary, length)

    if (handshake.type === ServerHello2.type)
      return this.onServerHello(binary, handshake.length)

    console.warn(handshake)
  }

  private async onServerHello(binary: Binary, length: number) {
    const hello = ServerHello2.read(binary, length)

    console.log(hello)
  }
}