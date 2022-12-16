import { Binary } from "@hazae41/binary"
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

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const type = binary.readUint8()
    const sublength = binary.readUint24()

    if (binary.offset - start !== length - sublength)
      throw new Error(`Invalid ${this.name} length`)

    return new this(type, sublength)
  }
}

export class Handshake {
  readonly class = Handshake

  static type = Record.types.handshake

  static types = {
    hello_request: 0,
    client_hello: 1,
    server_hello: 2,
    certificate: 11,
    server_key_exchange: 12,
    certificate_request: 13,
    server_hello_done: 14,
    certificate_verify: 15,
    client_key_exchange: 16,
    finished: 20,
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