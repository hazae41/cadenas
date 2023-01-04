import { Binary } from "@hazae41/binary"
import { Exportable, Writable } from "mods/binary/writable.js"
import { CipherSuite } from "mods/ciphers/cipher.js"
import { Secrets } from "mods/ciphers/secrets.js"
import { ReadableChecked } from "../readable.js"

export type Record<T extends Writable & Exportable> =
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

  plaintext<T extends Writable & Exportable & ReadableChecked<T>>(binary: Binary, clazz: T["class"]) {
    const fragment = clazz.read(binary, this.length)
    return new PlaintextRecord<T>(this.subtype, this.version, fragment)
  }

  ciphertext<T extends Writable & ReadableChecked<T>>(binary: Binary, clazz: T["class"]) {
    const fragment = clazz.read(binary, this.length)
    return new CiphertextRecord<T>(this.subtype, this.version, fragment)
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

  ciphertext() {
    return new CiphertextRecord<T>(this.subtype, this.version, this.fragment)
  }
}

export type GenericCipher =
  | GenericBlockCipher

export class GenericBlockCipher {

  constructor(
    readonly iv: Buffer,
    readonly content: Buffer,
    readonly mac: Buffer,
    readonly padding: Buffer,
    readonly padding_length: number
  ) { }

  static async from<T extends Writable & Exportable>(type: T) {
    const iv = Buffer.allocUnsafe(16)
    crypto.getRandomValues(iv)

    const content = type.export()

    const mac = Buffer.allocUnsafe(16)
    // TODO

    const padding = Buffer.allocUnsafe(0)

    return new this(content, iv, mac, padding, 0)
  }

  into<T extends Writable & ReadableChecked<T>>(clazz: T["class"]) {
    const decrypted = this.content // TODO
    const binary = new Binary(decrypted)

    return clazz.read(binary, binary.buffer.length)
  }

  size() {
    return this.iv.length + this.content.length + this.mac.length + this.padding.length + 1
  }

  async write(binary: Binary, cipher: CipherSuite, secrets: Secrets) {
    const iv = this.iv
    const key = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 256 }, false, ["encrypt"])

    const decrypted = this.content // TODO add mac and padding
    const encryped = await crypto.subtle.encrypt({ name: "AES-CBC", length: 256, iv }, key, decrypted)

    // TODO
  }

  static read<T extends Writable & ReadableChecked<T>>(binary: Binary, cipher: CipherSuite, clazz: T["class"]): GenericBlockCipher {
    throw new Error("Unimplemented") // TODO
  }
}

export class CiphertextRecord<T extends Writable> {
  readonly #class = CiphertextRecord

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
    return binary.buffer
  }
}