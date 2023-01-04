import { Binary } from "@hazae41/binary"
import { Writable } from "mods/binary/writable.js"
import { CipherSuite } from "mods/ciphers/cipher.js"
import { Secrets } from "mods/ciphers/secrets.js"
import { ReadableChecked } from "../readable.js"

export type Record<T extends Writable> =
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
      return this.read(binary)
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

  plaintext<T extends Writable & ReadableChecked<T>>(binary: Binary, clazz: T["class"]) {
    const fragment = clazz.read(binary, this.length)
    return new PlaintextRecord<T>(this.subtype, this.version, fragment)
  }

  ciphertext<T extends Writable & ReadableChecked<T>>(binary: Binary, cipher: CipherSuite, clazz: T["class"]) {
    const fragment = GenericBlockCipher.read<T>(binary, cipher, clazz)
    return new CiphertextRecord<T>(this.subtype, this.version, fragment)
  }
}

export class PlaintextRecord<T extends Writable> {
  readonly #class = PlaintextRecord<T>

  constructor(
    readonly subtype: number,
    readonly version: number,
    readonly fragment: T
  ) { }

  get class() {
    return this.#class
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

    return binary
  }

  async ciphertext(cipher: CipherSuite, secrets: Secrets) {
    const fragment = await GenericBlockCipher.from<T>(this.fragment, cipher, secrets)
    return new CiphertextRecord<T>(this.subtype, this.version, fragment)
  }
}

export type GenericCipher<T extends Writable> =
  | GenericBlockCipher<T>

export class GenericBlockCipher<T extends Writable> {

  constructor(
    readonly content: T,
    readonly IV: Buffer,
    readonly MAC: Buffer,
    readonly padding: Buffer,
    readonly padding_length: number
  ) { }

  static async from<T extends Writable>(content: T, cipher: CipherSuite, secrets: Secrets) {
    const IV = Buffer.allocUnsafe(16)
    crypto.getRandomValues(IV)

    const MAC = Buffer.allocUnsafe(16)
    const padding = Buffer.allocUnsafe(0)

    return new this(content, IV, MAC, padding, 0)
  }

  size() {
    return this.IV.length + this.content.size() + this.MAC.length + this.padding.length + 1
  }

  write(binary: Binary) {
    // TODO
  }

  static read<T extends Writable & ReadableChecked<T>>(binary: Binary, cipher: CipherSuite, clazz: T["class"]): GenericBlockCipher<T> {
    throw new Error("Unimplemented") // TODO
  }
}

export class CiphertextRecord<T extends Writable> {
  readonly #class = CiphertextRecord

  constructor(
    readonly subtype: number,
    readonly version: number,
    readonly fragment: GenericBlockCipher<T>
  ) { }

  get class() {
    return this.#class
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

    return binary
  }
}