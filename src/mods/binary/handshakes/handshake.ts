import { Binary } from "libs/binary.js"
import { Record } from "mods/binary/record/record.js"
import { Writable } from "mods/binary/writable.js"

export interface IHandshake extends Writable {
  type: number
}

export class HandshakeHeader {
  constructor(
    readonly type: number,
    readonly length: number
  ) { }

  size() {
    return 1 + 3
  }

  write(binary: Binary) {
    binary.writeUint8(this.type)
    binary.writeUint24(this.length)
  }

  static read(binary: Binary) {
    const type = binary.readUint8()
    const length = binary.readUint24()

    return new this(type, length)
  }
}

export class Handshake {
  readonly class = Handshake

  static type = Record.types.handshake

  static types = {
    client_hello: 1,
    server_hello: 2
  }

  constructor(
    readonly subtype: number,
    readonly fragment: Writable
  ) { }

  get type() {
    return this.class.type
  }

  static from(handshake: IHandshake) {
    return new this(handshake.type, handshake)
  }

  size() {
    return 1 + 3 + this.fragment.size()
  }

  write(binary: Binary) {
    binary.writeUint8(this.subtype)
    binary.writeUint24(this.fragment.size())
    this.fragment.write(binary)
  }

  record(version: number) {
    return Record.from(this, version)
  }
}