import { BinaryReadError, BinaryWriteError, Opaque, Writable } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { AEADCiphertextRecord, PlaintextRecord } from "mods/binary/records/record.js";
import { AEADEncrypter } from "mods/ciphers/encryptions/encryption.js";

export class GenericAEADCipher {

  constructor(
    readonly nonce_explicit: Bytes<8>,
    readonly block: Bytes
  ) { }

  trySize(): Result<number, never> {
    return new Ok(this.nonce_explicit.length + this.block.length)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      cursor.tryWrite(this.nonce_explicit).throw(t)
      cursor.tryWrite(this.block).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<GenericAEADCipher, BinaryReadError> {
    return Result.unthrowSync(t => {
      const nonce_explicit = cursor.tryRead(8).throw(t)
      const block = cursor.tryRead(cursor.remaining).throw(t)

      return new Ok(new GenericAEADCipher(nonce_explicit, block))
    })
  }

  static async tryEncrypt<T extends Writable.Infer<T>>(record: PlaintextRecord<T>, encrypter: AEADEncrypter, sequence: bigint) {
    return await Result.unthrow(async t => {
      const nonce = Cursor.allocUnsafe(encrypter.fixed_iv_length + 8)
      nonce.tryWrite(encrypter.secrets.client_write_IV).throw(t)
      nonce.tryWriteUint64(sequence).throw(t)

      nonce.offset = 0
      const nonce_implicit = nonce.tryRead(4).throw(t)
      const nonce_explicit = nonce.tryRead(8).throw(t)

      const content = Writable.tryWriteToBytes(record.fragment).throw(t)

      const additional_data = Cursor.allocUnsafe(8 + 1 + 2 + 2)
      additional_data.tryWriteUint64(sequence).throw(t)
      additional_data.tryWriteUint8(record.subtype).throw(t)
      additional_data.tryWriteUint16(record.version).throw(t)
      additional_data.tryWriteUint16(record.fragment.trySize().throw(t)).throw(t)

      // console.debug("-> nonce", nonce.bytes.length, Bytes.toHex(nonce.bytes))
      // console.debug("-> plaintext", content.length, Bytes.toHex(content))
      // console.debug("-> additional_data", additional_data.bytes.length, Bytes.toHex(additional_data.bytes))

      const ciphertext = await encrypter.encrypt(nonce.bytes, content, additional_data.bytes)

      // console.debug("-> ciphertext", ciphertext.length, Bytes.toHex(ciphertext))

      return new Ok(new GenericAEADCipher(nonce_explicit, ciphertext))
    })
  }

  async tryDecrypt(record: AEADCiphertextRecord, encrypter: AEADEncrypter, sequence: bigint) {
    return await Result.unthrow(async t => {
      const nonce = Cursor.allocUnsafe(encrypter.fixed_iv_length + 8)
      nonce.tryWrite(encrypter.secrets.server_write_IV).throw(t)
      nonce.tryWrite(this.nonce_explicit).throw(t)

      const additional_data = Cursor.allocUnsafe(8 + 1 + 2 + 2)
      additional_data.tryWriteUint64(sequence).throw(t)
      additional_data.tryWriteUint8(record.subtype).throw(t)
      additional_data.tryWriteUint16(record.version).throw(t)
      additional_data.tryWriteUint16(record.fragment.trySize().throw(t) - 24).throw(t)

      // console.debug("<- nonce", nonce.bytes.length, Bytes.toHex(nonce.bytes))
      // console.debug("<- ciphertext", this.block.length, Bytes.toHex(this.block))
      // console.debug("<- additional_data", additional_data.bytes.length, Bytes.toHex(additional_data.bytes))

      const plaintext = await encrypter.decrypt(nonce.bytes, this.block, additional_data.bytes)

      // console.debug("<- plaintext", plaintext.length, Bytes.toHex(plaintext))

      return new Ok(new Opaque(plaintext))
    })
  }

}