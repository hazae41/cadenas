import { Binary } from "@hazae41/binary";
import { PlaintextRecord, Record } from "mods/binary/record/record.js";

export class ChangeCipherSpec {
  readonly #class = ChangeCipherSpec

  static type = Record.types.change_cipher_spec

  static types = {
    change_cipher_spec: 1
  } as const

  constructor(
    readonly subtype: number = ChangeCipherSpec.types.change_cipher_spec
  ) { }

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
  }

  size() {
    return 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.subtype)
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const subtype = binary.readUint8()

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(subtype)
  }

  record(version: number) {
    return new PlaintextRecord<ChangeCipherSpec>(this.class.type, version, this)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.buffer
  }
}