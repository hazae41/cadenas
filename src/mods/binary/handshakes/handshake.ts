import { Binary } from "@hazae41/binary"
import { PlaintextRecord, Record } from "mods/binary/record/record.js"
import { Writable } from "mods/binary/writable.js"

export class HandshakeHeader {
  readonly #class = HandshakeHeader

  static type = Record.types.handshake

  constructor(
    readonly subtype: number,
    readonly length: number
  ) { }

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
  }

  size() {
    return 1 + 3
  }

  write(binary: Binary) {
    binary.writeUint8(this.subtype)
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

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.buffer
  }
}

export class Handshake<T extends Writable> {
  readonly #class = Handshake

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
  } as const

  constructor(
    readonly subtype: number,
    readonly fragment: T
  ) { }

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
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
    return new PlaintextRecord<Handshake<T>>(this.class.type, version, this)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.buffer
  }
}