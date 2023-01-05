import { Binary } from "@hazae41/binary"
import { HMAC } from "mods/algorithms/hmac/hmac.js"
import { Exportable, Writable } from "mods/binary/writable.js"
import { CipherSuite } from "mods/ciphers/cipher.js"
import { Secrets } from "mods/ciphers/secrets.js"
import { ReadableLenghted } from "../readable.js"

export type Record =
  | PlaintextRecord
  | CiphertextRecord

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

  plaintext<T extends Writable & Exportable & ReadableLenghted<T>>(binary: Binary, clazz: T["class"]) {
    const fragment = clazz.read(binary, this.length)
    return new PlaintextRecord<T>(this.subtype, this.version, fragment)
  }

  // ciphertext<T extends Writable & ReadableChecked<T>>(binary: Binary, clazz: T["class"]) {
  //   const fragment = clazz.read(binary, this.length)
  //   return new CiphertextRecord<T>(this.subtype, this.version, fragment)
  // }
}

export class PlaintextRecord<T extends Writable & Exportable = any> {
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

  // ciphertext() {
  //   return new CiphertextRecord<T>(this.subtype, this.version, this.fragment)
  // }
}

export type DecryptedGenericCipher =
  | DecryptedGenericBlockCipher

export type EncryptedGenericCipher =
  | EncryptedGenericBlockCipher

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

export class EncryptedGenericBlockCipher {

  constructor(
    readonly iv: Buffer,
    readonly block: Buffer
  ) { }

  size() {
    return this.iv.length + this.block.length
  }

  write(binary: Binary) {
    binary.write(this.iv)
    binary.write(this.block)
  }

  static read(binary: Binary, length: number) {

  }

  async decrypt() {

  }
}

export class DecryptedGenericBlockCipher {

  constructor(
    readonly iv: Buffer,
    readonly content: Buffer,
    readonly mac: Buffer,
    readonly padding: Buffer
  ) { }

  get padding_length() {
    return this.padding[this.padding.length - 1]
  }

  into<T extends Writable & ReadableLenghted<T>>(clazz: T["class"]) {
    const binary = new Binary(this.content)
    return clazz.read(binary, this.content.length)
  }

  static async from<T extends Writable & Exportable>(plaintext: PlaintextRecord, secrets: Secrets, sequence: bigint) {
    const iv = Buffer.allocUnsafe(16)
    crypto.getRandomValues(iv)

    const content = plaintext.fragment.export()

    const premac = Binary.allocUnsafe(8)
    premac.writeUint64(sequence)
    plaintext.write(premac)

    const mac = await HMAC("SHA-1", secrets.client_write_MAC_key, premac.buffer)

    const length = content.length + mac.length
    const padding_length = modulup(length + 1, 16)
    const padding = Buffer.allocUnsafe(padding_length + 1)
    padding.fill(padding_length)

    return new this(content, iv, mac, padding)
  }

  async encrypt(cipher: CipherSuite, secrets: Secrets) {
    const plaintext = Buffer.concat([this.content, this.mac, this.padding])

    const key = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 256 }, false, ["encrypt"])

    const ciphertext = await crypto.subtle.encrypt({ name: "AES-CBC", length: 256, iv: this.iv }, key, plaintext)

    return new EncryptedGenericBlockCipher(this.iv, Buffer.from(ciphertext))
  }
}

export class CiphertextRecord<T extends EncryptedGenericCipher = any> {
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

  export(cipher: CipherSuite, secrets: Secrets) {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.buffer
  }
}