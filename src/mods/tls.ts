import { Binary } from "libs/binary.js"
import { Alert } from "mods/binary/alerts/alert.js"
import { ClientHello } from "mods/binary/handshakes/client_hello/handshake.js"
import { RecordHeader } from "mods/binary/record/record.js"
import { Transport } from "mods/transports/transport.js"

export class Tls {

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
      .record(0x0304)
      .export()
    await this.transport.send(hello.buffer)
  }

  async onData(data: Buffer) {
    console.log("<-", data)
    const binary = new Binary(data)
    const recordh = RecordHeader.read(binary)

    if (recordh.type === Alert.type) {
      const fragment = Alert.read(binary)
      console.log(fragment)
    }

    console.log(recordh)
  }
}