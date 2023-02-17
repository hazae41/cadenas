import { Cursor, Writable } from "@hazae41/binary";
import { Opaque } from "mods/binary/opaque.js";
import { AEADCiphertextRecord, PlaintextRecord } from "mods/binary/records/record.js";
import { AEADEncrypter } from "mods/ciphers/encryptions/encryption.js";

export class GenericAEADCipher {

  constructor(
    readonly nonce_explicit: Uint8Array,
    readonly block: Uint8Array
  ) { }

  size() {
    return this.nonce_explicit.length + this.block.length
  }

  write(cursor: Cursor) {
    cursor.write(this.nonce_explicit)
    cursor.write(this.block)
  }

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset

    const nonce_explicit = cursor.read(8)
    const block = cursor.read(length - 8)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(nonce_explicit, block)
  }

  static async encrypt<T extends Writable>(record: PlaintextRecord<T>, encrypter: AEADEncrypter, sequence: bigint) {
    const nonce = Cursor.allocUnsafe(encrypter.fixed_iv_length + 8)
    nonce.write(encrypter.secrets.client_write_IV)
    nonce.writeUint64(sequence)

    nonce.offset = 0
    const nonce_implicit = nonce.read(4)
    const nonce_explicit = nonce.read(8)

    const content = Writable.toBytes(record.fragment)

    const additional_data = Cursor.allocUnsafe(8 + 1 + 2 + 2)
    additional_data.writeUint64(sequence)
    additional_data.writeUint8(record.subtype)
    additional_data.writeUint16(record.version)
    additional_data.writeUint16(record.fragment.size())

    // console.debug("-> nonce", nonce.bytes.length, Bytes.toHex(nonce.bytes))
    // console.debug("-> plaintext", content.length, Bytes.toHex(content))
    // console.debug("-> additional_data", additional_data.bytes.length, Bytes.toHex(additional_data.bytes))

    const ciphertext = await encrypter.encrypt(nonce.bytes, content, additional_data.bytes)

    // console.debug("-> ciphertext", ciphertext.length, Bytes.toHex(ciphertext))

    return new this(nonce_explicit, ciphertext)
  }

  async decrypt(record: AEADCiphertextRecord, encrypter: AEADEncrypter, sequence: bigint) {
    const nonce = Cursor.allocUnsafe(encrypter.fixed_iv_length + 8)
    nonce.write(encrypter.secrets.server_write_IV)
    nonce.write(this.nonce_explicit)

    const additional_data = Cursor.allocUnsafe(8 + 1 + 2 + 2)
    additional_data.writeUint64(sequence)
    additional_data.writeUint8(record.subtype)
    additional_data.writeUint16(record.version)
    additional_data.writeUint16(record.fragment.size() - 24)

    // console.debug("<- nonce", nonce.bytes.length, Bytes.toHex(nonce.bytes))
    // console.debug("<- ciphertext", this.block.length, Bytes.toHex(this.block))
    // console.debug("<- additional_data", additional_data.bytes.length, Bytes.toHex(additional_data.bytes))

    const plaintext = await encrypter.decrypt(nonce.bytes, this.block, additional_data.bytes)

    // console.debug("<- plaintext", plaintext.length, Bytes.toHex(plaintext))

    return new Opaque(plaintext)
  }

}