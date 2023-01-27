import { Binary } from "@hazae41/binary";
import { Bytes } from "libs/bytes/bytes.js";
import { Opaque } from "mods/binary/opaque.js";
import { AEADCiphertextRecord, PlaintextRecord } from "mods/binary/records/record.js";
import { Exportable, Writable } from "mods/binary/writable.js";
import { AEADEncrypter } from "mods/ciphers/encryptions/encryption.js";

export class GenericAEADCipher {
  readonly #class = GenericAEADCipher

  constructor(
    readonly nonce_explicit: Uint8Array,
    readonly block: Uint8Array
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return this.nonce_explicit.length + this.block.length
  }

  write(binary: Binary) {
    binary.write(this.nonce_explicit)
    binary.write(this.block)
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const nonce_explicit = binary.read(12)
    const block = binary.read(length - 12)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(nonce_explicit, block)
  }

  static async encrypt<T extends Writable & Exportable>(record: PlaintextRecord<T>, encrypter: AEADEncrypter, sequence: bigint) {
    const content = record.fragment.export()

    const additional_data = Binary.allocUnsafe(8 + 1 + 2 + 2)
    additional_data.writeUint64(sequence)
    additional_data.writeUint8(record.subtype)
    additional_data.writeUint16(record.version)
    additional_data.writeUint16(record.fragment.size())

    console.log("server_write_IV", encrypter.secrets.server_write_IV.length, Bytes.toHex(encrypter.secrets.server_write_IV))
    console.log("client_write_IV", encrypter.secrets.client_write_IV.length, Bytes.toHex(encrypter.secrets.client_write_IV))

    const nonce = Binary.allocUnsafe(4 + 8)
    nonce.write(encrypter.secrets.client_write_IV)
    nonce.writeUint64(sequence)
    nonce.offset = 0

    const nonce_implicit = nonce.read(4)
    const nonce_explicit = nonce.read(8)

    const ciphertext = await encrypter.encrypt(nonce.bytes, content, additional_data.bytes)

    console.log("-> plaintext", content.length, Bytes.toHex(content))
    console.log("-> ciphertext", ciphertext.length, Bytes.toHex(ciphertext))
    console.log("-> nonce", nonce.bytes.length, Bytes.toHex(nonce.bytes))
    console.log("-> nonce_explicit", nonce_explicit.length, Bytes.toHex(nonce_explicit))
    console.log("-> additional_data", additional_data.bytes.length, Bytes.toHex(additional_data.bytes))

    return new this(nonce_explicit, ciphertext)
  }

  async decrypt(record: AEADCiphertextRecord, encrypter: AEADEncrypter, sequence: bigint) {
    const additional_data = Binary.allocUnsafe(8 + 1 + 2 + 2)
    additional_data.writeUint64(sequence)
    additional_data.writeUint8(record.subtype)
    additional_data.writeUint16(record.version)
    additional_data.writeUint16(record.fragment.size())

    const plaintext = await encrypter.decrypt(this.nonce_explicit, this.block, additional_data.bytes)

    // console.log("<- content", raw.length, Bytes.toHex(raw))
    // console.log("<- mac", mac.length, Bytes.toHex(mac))

    return new Opaque(plaintext)
  }

}