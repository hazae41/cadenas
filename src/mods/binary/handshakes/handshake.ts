import { Binary } from "libs/binary.js"
import { ClientHello2, ClientHello3 } from "mods/binary/handshakes/client_hello/handshake.js"
import { Record } from "../record/record.js"

export type Handshakes =
  | ClientHello2
  | ClientHello3

export class Handshake {
  readonly class = Handshake

  static type = Record.types.handshake

  static types = {
    client_hello: 1,
    server_hello: 2
  }

  constructor(
    readonly handshake: Handshakes
  ) { }

  get type() {
    return this.class.type
  }

  size() {
    return 1 + 3 + this.handshake.size()
  }

  write(binary: Binary) {
    binary.writeUint8(this.handshake.type)
    binary.writeUint24(this.handshake.size())
    this.handshake.write(binary)
  }

  record(version: number) {
    return Record.from(this, version)
  }
}