import { Binary } from "libs/binary.js"
import { ClientHello } from "mods/binary/handshakes/client_hello/handshake.js"

export type Handshakes =
  | ClientHello

export class Handshake {
  readonly class = Handshake

  static types = {
    client_hello: 1,
    server_hello: 2
  }

  constructor(
    readonly handshake: Handshakes
  ) { }

  size() {
    return 1 + 3 + this.handshake.size()
  }

  write(binary: Binary) {
    binary.writeUint8(this.handshake.type)
    binary.writeUint24(this.handshake.size())
    this.handshake.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())

    this.write(binary)

    return binary
  }
}