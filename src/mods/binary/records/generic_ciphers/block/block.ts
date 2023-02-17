import { Cursor } from "@hazae41/binary"
import { Bytes } from "@hazae41/bytes"
import { Writable } from "mods/binary/fragment.js"
import { Opaque } from "mods/binary/opaque.js"
import { BlockCiphertextRecord, PlaintextRecord } from "mods/binary/records/record.js"
import { BlockEncrypter } from "mods/ciphers/encryptions/encryption.js"

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

export class GenericBlockCipher {
  constructor(
    readonly iv: Uint8Array,
    readonly block: Uint8Array
  ) { }

  size() {
    return this.iv.length + this.block.length
  }

  write(cursor: Cursor) {
    cursor.write(this.iv)
    cursor.write(this.block)
  }

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset

    const iv = cursor.read(16)
    const block = cursor.read(length - 16)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(iv, block)
  }

  static async encrypt<T extends Writable>(record: PlaintextRecord<T>, encrypter: BlockEncrypter, sequence: bigint) {
    const iv = Bytes.random(16)

    const content = record.fragment.export()

    const premac = Cursor.allocUnsafe(8 + record.size())
    premac.writeUint64(sequence)
    record.write(premac)

    const mac = await encrypter.macher.write(premac.bytes)

    const length = content.length + mac.length
    const padding_length = modulup(length + 1, 16)
    const padding = Bytes.allocUnsafe(padding_length + 1)
    padding.fill(padding_length)

    const plaintext = Bytes.concat([content, mac, padding])
    const ciphertext = await encrypter.encrypt(iv, plaintext)

    // console.debug("-> iv", iv.length, Bytes.toHex(iv))
    // console.debug("-> plaintext", plaintext.length, Bytes.toHex(plaintext))
    // console.debug("-> content", content.length, Bytes.toHex(content))
    // console.debug("-> mac", mac.length, Bytes.toHex(mac))
    // console.debug("-> ciphertext", ciphertext.length, Bytes.toHex(ciphertext))

    return new this(iv, ciphertext)
  }

  async decrypt(record: BlockCiphertextRecord, encrypter: BlockEncrypter, sequence: bigint) {
    const plaintext = await encrypter.decrypt(this.iv, this.block)

    const content = plaintext.subarray(0, -encrypter.macher.mac_length)
    const mac = plaintext.subarray(-encrypter.macher.mac_length)

    // console.debug("<- content", content.length, Bytes.toHex(content))
    // console.debug("<- mac", mac.length, Bytes.toHex(mac))

    return new Opaque(content)
  }
}