import { Binary } from "@hazae41/binary"
import { Bytes } from "libs/bytes/bytes.js"
import { Opaque } from "mods/binary/opaque.js"
import { PlaintextRecord } from "mods/binary/records/record.js"
import { Exportable, Writable } from "mods/binary/writable.js"
import { Cipherer } from "mods/ciphers/cipher.js"

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

export class PlaintextGenericBlockCipher<T extends Writable & Exportable> {
  readonly #class = PlaintextGenericBlockCipher

  constructor(
    readonly iv: Uint8Array,
    readonly content: T,
    readonly mac: Uint8Array
  ) { }

  get class() {
    return this.#class
  }

  static async from<T extends Writable & Exportable>(plaintext: PlaintextRecord<T>, cipherer: Cipherer, sequence: bigint) {
    const iv = Bytes.random(16)

    const content = plaintext.fragment

    const premac = Binary.allocUnsafe(8 + plaintext.size())
    premac.writeUint64(sequence)
    plaintext.write(premac)

    const mac = await cipherer.hasher.mac(premac.bytes)

    return new this<T>(iv, content, mac)
  }

  async encrypt(cipherer: Cipherer) {
    const content = this.content.export()

    const length = content.length + this.mac.length
    const padding_length = modulup(length + 1, 16)
    const padding = Bytes.allocUnsafe(padding_length + 1)
    padding.fill(padding_length)

    const plaintext = Bytes.concat([content, this.mac, padding])
    const ciphertext = await cipherer.encrypter.encrypt(this.iv, plaintext)

    // console.log("-> content", content.length, Bytes.toHex(content))
    // console.log("-> mac", this.mac.length, Bytes.toHex(this.mac))

    return new CiphertextGenericBlockCipher<T>(this.iv, ciphertext)
  }
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

  async decrypt(cipherer: Cipherer) {
    const plaintext = await cipherer.encrypter.decrypt(this.iv, this.block)

    const raw = plaintext.subarray(0, -21)
    const mac = plaintext.subarray(-21, -1)

    // console.log("<- content", raw.length, Bytes.toHex(raw))
    // console.log("<- mac", mac.length, Bytes.toHex(mac))

    const content = new Opaque(raw)

    return new PlaintextGenericBlockCipher(this.iv, content, mac)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.buffer
  }
}