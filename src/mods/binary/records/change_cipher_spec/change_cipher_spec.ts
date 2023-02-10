import { Binary } from "@hazae41/binary";
import { PlaintextRecord, Record } from "mods/binary/records/record.js";

export class ChangeCipherSpec {
  readonly #class = ChangeCipherSpec

  static readonly type = Record.types.change_cipher_spec

  static readonly types = {
    change_cipher_spec: 1
  } as const

  constructor(
    readonly subtype: number = ChangeCipherSpec.types.change_cipher_spec
  ) { }

  get type() {
    return this.#class.type
  }

  size() {
    return 1
  }

  write(cursor: Binary) {
    cursor.writeUint8(this.subtype)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  record(version: number) {
    return new PlaintextRecord<ChangeCipherSpec>(this.#class.type, version, this)
  }

  static read(cursor: Binary, length: number) {
    const start = cursor.offset

    const subtype = cursor.readUint8()

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(subtype)
  }
}