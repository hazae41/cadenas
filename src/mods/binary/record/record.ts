import { Binary } from "@hazae41/binary"
import { Bytes } from "libs/bytes/bytes.js"
import { Exportable, Writable } from "mods/binary/writable.js"
import { CipherSuite } from "mods/ciphers/cipher.js"
import { Secrets } from "mods/ciphers/secrets.js"
import { ReadableLenghted } from "../readable.js"

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

  ciphertext(fragment: CiphertextGenericCipher<T>) {
    return new CiphertextRecord<T>(this.subtype, this.version, fragment)
  }
}

export type PlaintextGenericCipher<T extends Writable & Exportable & ReadableLenghted<T>> =
  | PlaintextGenericBlockCipher<T>

export type CiphertextGenericCipher<T extends Writable & Exportable> =
  | CiphertextGenericBlockCipher<T>

/**
 * (y % m) where (x + y) % m == 0
 * @nomaths Calculate the remaining y to add to x in order to reach the next m multiple
 * @param x value
 * @param m modulus
 * @returns y
 */
function modulup(x: number, m: number) {
  return (m - ((x + m) % m)) % m
}

export class CiphertextGenericBlockCipher<T extends Writable & Exportable> {
  readonly #class = CiphertextGenericBlockCipher

  constructor(
    readonly iv: Uint8Array,
    readonly block: Uint8Array
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return this.iv.length + this.block.length
  }

  write(binary: Binary) {
    binary.write(this.iv)
    binary.write(this.block)
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const iv = binary.read(16)
    const block = binary.read(length - 16)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(iv, block)
  }

  async decrypt(cipher: CipherSuite, secrets: Secrets) {
    const key = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-CBC", length: 256 }, false, ["decrypt"])
    const plaintext = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", length: 256, iv: this.iv }, key, this.block))

    const content = plaintext.subarray(0, -21)
    const mac = plaintext.subarray(-21, -1)

    return new PlaintextGenericBlockCipher(this.iv, content, mac)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.buffer
  }
}

export class PlaintextGenericBlockCipher<T extends Writable & Exportable & ReadableLenghted<T>> {
  readonly #class = PlaintextGenericBlockCipher

  constructor(
    readonly iv: Uint8Array,
    readonly content: Uint8Array,
    readonly mac: Uint8Array
  ) { }

  get class() {
    return this.#class
  }

  static async from<T extends Writable & Exportable>(plaintext: PlaintextRecord<T>, secrets: Secrets, sequence: bigint) {
    const iv = Bytes.random(16)

    const content = plaintext.fragment.export()

    const premac = Binary.allocUnsafe(8 + plaintext.size())
    premac.writeUint64(sequence)
    plaintext.write(premac)

    const mac_key = await crypto.subtle.importKey("raw", secrets.client_write_MAC_key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"])
    const mac = new Uint8Array(await crypto.subtle.sign("HMAC", mac_key, premac.bytes))

    return new this(iv, content, mac)
  }

  async encrypt(cipher: CipherSuite, secrets: Secrets) {
    const length = this.content.length + this.mac.length
    const padding_length = modulup(length + 1, 16)
    const padding = Bytes.allocUnsafe(padding_length + 1)
    padding.fill(padding_length)

    const plaintext = Bytes.concat([this.content, this.mac, padding])

    const key = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 256 }, false, ["encrypt"])
    const pkcs7 = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", length: 256, iv: this.iv }, key, plaintext))

    const ciphertext = pkcs7.subarray(0, -16)

    return new CiphertextGenericBlockCipher<T>(this.iv, ciphertext)
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

  static body<T extends Writable & Exportable & ReadableLenghted<T>>(
    header: RecordHeader,
    binary: Binary,
    clazz: CiphertextGenericCipher<T>["class"]
  ) {
    const fragment = clazz.read(binary, this.length)
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

  decrypt(cipher: CipherSuite, secrets: Secrets) {

  }
}