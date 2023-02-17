import { Cursor, Opaque, UnsafeOpaque, Writable } from "@hazae41/binary"
import { PlaintextRecord, Record } from "mods/binary/records/record.js"

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

  get type() {
    return this.#class.type
  }

  size() {
    return 1 + 3 + this.fragment.size()
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.subtype)
    cursor.writeUint24(this.fragment.size())
    this.fragment.write(cursor)
  }

  record(version: number) {
    return new PlaintextRecord(this.#class.type, version, this)
  }

  static read(cursor: Cursor) {
    const subtype = cursor.readUint8()
    const size = cursor.readUint24()

    const subcursor = new Cursor(cursor.read(size))
    const fragment = UnsafeOpaque.read(subcursor)

    return new this<Opaque>(subtype, fragment)
  }
}