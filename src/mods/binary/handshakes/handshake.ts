import { Binary } from "libs/binary.js"
import { Record } from "mods/binary/record/record.js"
import { Writable } from "mods/binary/writable.js"

export interface IHandshake extends Writable {
  type: number
}

export class Handshake {
  readonly class = Handshake

  static type = Record.types.handshake

  static types = {
    client_hello: 1,
    server_hello: 2
  }

  constructor(
    readonly handshake: IHandshake
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