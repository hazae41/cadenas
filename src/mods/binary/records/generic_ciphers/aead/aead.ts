import { Opaque, Writable } from "@hazae41/binary";
import { Bytes, Uint8Array } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { AEADCiphertextRecord, PlaintextRecord } from "mods/binary/records/record.js";
import { AEADEncrypter } from "mods/ciphers/encryptions/encryption.js";

export class GenericAEADCipher {

  constructor(
    readonly nonce_explicit: Uint8Array<8>,
    readonly block: Uint8Array
  ) { }

  sizeOrThrow() {
    return this.nonce_explicit.length + this.block.length
  }

  writeOrThrow(cursor: Cursor) {
    cursor.writeOrThrow(this.nonce_explicit)
    cursor.writeOrThrow(this.block)
  }

  static readOrThrow(cursor: Cursor) {
    const nonce_explicit = cursor.readAndCopyOrThrow(8)
    const block = cursor.readAndCopyOrThrow(cursor.remaining)

    return new GenericAEADCipher(nonce_explicit, block)
  }

  static async tryEncrypt<T extends Writable>(record: PlaintextRecord<T>, encrypter: AEADEncrypter, sequence: bigint): Promise<Result<GenericAEADCipher, Error>> {
    return await Result.unthrow(async t => {
      const nonce = new Cursor(Bytes.alloc(encrypter.fixed_iv_length + 8))
      nonce.tryWrite(encrypter.secrets.client_write_IV).throw(t)
      nonce.tryWriteUint64(sequence).throw(t)

      nonce.offset = 0
      const nonce_implicit = nonce.tryRead(4).throw(t)
      const nonce_explicit = nonce.tryRead(8).throw(t)

      const content = Writable.tryWriteToBytes(record.fragment).throw(t)

      const additional_data = new Cursor(Bytes.alloc(8 + 1 + 2 + 2))
      additional_data.tryWriteUint64(sequence).throw(t)
      additional_data.tryWriteUint8(record.type).throw(t)
      additional_data.tryWriteUint16(record.version).throw(t)
      additional_data.tryWriteUint16(record.fragment.sizeOrThrow()).throw(t)

      // Console.debug("-> nonce", nonce.bytes.length, Bytes.toHex(nonce.bytes))
      // Console.debug("-> plaintext", content.length, Bytes.toHex(content))
      // Console.debug("-> additional_data", additional_data.bytes.length, Bytes.toHex(additional_data.bytes))

      const ciphertext = await encrypter.tryEncrypt(nonce.bytes, content, additional_data.bytes).then(r => r.throw(t))

      // Console.debug("-> ciphertext", ciphertext.length, Bytes.toHex(ciphertext))

      return new Ok(new GenericAEADCipher(nonce_explicit, ciphertext))
    })
  }

  async decryptOrThrow(record: AEADCiphertextRecord, encrypter: AEADEncrypter, sequence: bigint) {
    const nonce = new Cursor(new Uint8Array(encrypter.fixed_iv_length + 8))
    nonce.writeOrThrow(encrypter.secrets.server_write_IV)
    nonce.writeOrThrow(this.nonce_explicit)

    const additional_data = new Cursor(Bytes.alloc(8 + 1 + 2 + 2))
    additional_data.writeUint64OrThrow(sequence)
    additional_data.writeUint8OrThrow(record.type)
    additional_data.writeUint16OrThrow(record.version)
    additional_data.writeUint16OrThrow(record.fragment.sizeOrThrow() - 24)

    // Console.debug("<- nonce", nonce.bytes.length, Bytes.toHex(nonce.bytes))
    // Console.debug("<- ciphertext", this.block.length, Bytes.toHex(this.block))
    // Console.debug("<- additional_data", additional_data.bytes.length, Bytes.toHex(additional_data.bytes))

    const plaintext = await encrypter.tryDecrypt(nonce.bytes, this.block, additional_data.bytes).then(r => r.unwrap())

    // Console.debug("<- plaintext", plaintext.length, Bytes.toHex(plaintext))

    return new Opaque(plaintext)
  }

}