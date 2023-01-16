import { Binary } from "@hazae41/binary";
import { Bytes } from "libs/bytes/bytes.js";
import { CiphertextRecord, PlaintextRecord } from "mods/binary/records/record.js";
import { Exportable, Writable } from "mods/binary/writable.js";
import { AEADCipherer } from "mods/ciphers/cipher.js";

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

  static async encrypt<T extends Writable & Exportable>(record: PlaintextRecord<T>, cipherer: AEADCipherer, sequence: bigint) {
    const content = record.fragment.export()

    const additional_data = Binary.allocUnsafe(8 + 1 + 2 + 2)
    additional_data.writeUint64(sequence)
    additional_data.writeUint8(record.subtype)
    additional_data.writeUint16(record.version)
    additional_data.writeUint16(record.fragment.size())

    const nonce = Binary.allocUnsafe(4 + 8)
    nonce.write(cipherer.secrets.client_write_IV)
    nonce.writeUint64(sequence)
    nonce.offset = 0

    const nonce_implicit = nonce.read(4)
    const nonce_explicit = nonce.read(8)

    const ciphertext = await cipherer.encrypter.encrypt(nonce.bytes, content, additional_data.bytes)

    console.log("-> content", content.length, Bytes.toHex(content))
    console.log("-> mac", nonce_explicit.length, Bytes.toHex(nonce_explicit))

    return new this(nonce_explicit, ciphertext)
  }

  async decrypt(record: CiphertextRecord, cipherer: AEADCipherer, sequence: bigint) {
    const additional_data = Binary.allocUnsafe(8 + 1 + 2 + 2)
    additional_data.writeUint64(sequence)
    additional_data.writeUint8(record.subtype)
    additional_data.writeUint16(record.version)
    additional_data.writeUint16(record.fragment.size())

    const plaintext = await cipherer.encrypter.decrypt(this.nonce_explicit, this.block, additional_data.bytes)

    // console.log("<- content", raw.length, Bytes.toHex(raw))
    // console.log("<- mac", mac.length, Bytes.toHex(mac))

    return plaintext
  }

}