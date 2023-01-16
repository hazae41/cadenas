import { Binary } from "@hazae41/binary"
import { ReadableLenghted } from "mods/binary/readable.js"
import { PlaintextGenericBlockCipher } from "mods/binary/records/generic_ciphers/block/block.js"
import { CiphertextGenericCipher } from "mods/binary/records/generic_ciphers/types.js"
import { Exportable, Writable } from "mods/binary/writable.js"
import { Cipherer } from "mods/ciphers/cipher.js"

export type Record<T extends Writable & Exportable & ReadableLenghted<T>> =
  | PlaintextRecord<T>
  | CiphertextRecord<T>

export namespace Record {

  export const types = {
    invalid: 0,
    change_cipher_spec: 20,
    alert: 21,
    handshake: 22,
    application_data: 23
  }

}

export class RecordHeader {
  readonly #class = RecordHeader

  constructor(
    readonly subtype: number,
    readonly version: number,
    readonly length: number
  ) { }

  size() {
    return 1 + 2 + 2
  }

  write(binary: Binary) {
    binary.writeUint8(this.subtype)
    binary.writeUint16(this.version)
    binary.writeUint16(this.length)
  }

  static tryRead(binary: Binary) {
    const start = binary.offset

    try {
      const header = this.read(binary)

      if (binary.remaining < header.length)
        throw new Error(`Partial record`)

      return header
    } catch (e: unknown) {
      binary.offset = start
    }
  }

  static read(binary: Binary) {
    const type = binary.readUint8()
    const version = binary.readUint16()
    const length = binary.readUint16()

    return new this(type, version, length)
  }
}


export class PlaintextRecord<T extends Writable & Exportable> {
  readonly #class = PlaintextRecord<T>

  constructor(
    readonly subtype: number,
    readonly version: number,
    readonly fragment: T
  ) { }

  get class() {
    return this.#class
  }

  static from<T extends Writable & Exportable & ReadableLenghted<T>>(
    header: RecordHeader,
    fragment: T
  ) {
    return new this<T>(header.subtype, header.version, fragment)
  }

  size() {
    return 1 + 2 + 2 + this.fragment.size()
  }

  write(binary: Binary) {
    binary.writeUint8(this.subtype)
    binary.writeUint16(this.version)
    binary.writeUint16(this.fragment.size())
    this.fragment.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.buffer
  }

  async encrypt(cipherer: Cipherer, sequence: bigint) {
    const pfragment = await PlaintextGenericBlockCipher.from<T>(this, cipherer, sequence)
    const cfragment = await pfragment.encrypt(cipherer)

    return new CiphertextRecord<T>(this.subtype, this.version, cfragment)
  }
}

export class CiphertextRecord<T extends Writable & Exportable> {
  readonly #class = CiphertextRecord

  constructor(
    readonly subtype: number,
    readonly version: number,
    readonly fragment: CiphertextGenericCipher<T>
  ) { }

  get class() {
    return this.#class
  }

  static from<T extends Writable & Exportable>(header: RecordHeader, fragment: CiphertextGenericCipher<T>) {
    return new this<T>(header.subtype, header.version, fragment)
  }

  size() {
    return 1 + 2 + 2 + this.fragment.size()
  }

  write(binary: Binary) {
    binary.writeUint8(this.subtype)
    binary.writeUint16(this.version)
    binary.writeUint16(this.fragment.size())
    this.fragment.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.buffer
  }

  async decrypt(cipherer: Cipherer) {
    const { content } = await this.fragment.decrypt(cipherer)

    return new PlaintextRecord(this.subtype, this.version, content)
  }
}
