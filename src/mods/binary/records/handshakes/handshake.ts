import { Binary } from "@hazae41/binary"
import { Writable } from "mods/binary/fragment.js"
import { Opaque } from "mods/binary/opaque.js"
import { PlaintextRecord, Record } from "mods/binary/records/record.js"

export class HandshakeHeader {
  readonly #class = HandshakeHeader

  static readonly type = Record.types.handshake

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

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary, length: number) {
    console.log(binary.after)

    const start = binary.offset

    const type = binary.readUint8()
    const sublength = binary.readUint24()

    if (binary.offset - start !== length - sublength)
      throw new Error(`Invalid ${this.name} length`)

    return new this(type, sublength)
  }
}

export class Handshake<T extends Writable> {
  readonly #class = Handshake

  static readonly type = Record.types.handshake

  static readonly types = {
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

  static from<T extends Writable>(header: HandshakeHeader, fragment: T) {
    return new this(header.subtype, fragment)
  }

  size() {
    return 1 + 3 + this.fragment.size()
  }

  write(binary: Binary) {
    binary.writeUint8(this.subtype)
    binary.writeUint24(this.fragment.size())
    this.fragment.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  record(version: number) {
    return new PlaintextRecord(this.class.type, version, this)
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const subtype = binary.readUint8()
    const size = binary.readUint24()
    const fragment = Opaque.read(binary, size)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(subtype, fragment)
  }
}