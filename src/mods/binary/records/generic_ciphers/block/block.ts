import { BinaryReadError, BinaryWriteError, Opaque, Writable } from "@hazae41/binary"
import { Bytes } from "@hazae41/bytes"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { CryptoError } from "libs/crypto/crypto.js"
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
    readonly iv: Bytes<16>,
    readonly block: Bytes
  ) { }

  trySize(): Result<number, never> {
    return new Ok(this.iv.length + this.block.length)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      cursor.tryWrite(this.iv).throw(t)
      cursor.tryWrite(this.block).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<GenericBlockCipher, BinaryReadError> {
    return Result.unthrowSync(t => {
      const iv = cursor.tryRead(16).throw(t)
      const block = cursor.tryRead(cursor.remaining).throw(t)

      return new Ok(new GenericBlockCipher(iv, block))
    })
  }

  static async tryEncrypt<T extends Writable.Infer<T>>(record: PlaintextRecord<T>, encrypter: BlockEncrypter, sequence: bigint): Promise<Result<GenericBlockCipher, Writable.SizeError<T> | Writable.WriteError<T> | BinaryWriteError | CryptoError>> {
    return await Result.unthrow(async t => {
      const iv = Bytes.random(16)

      const content = Writable.tryWriteToBytes(record.fragment).throw(t)

      const premac = new Cursor(Bytes.tryAllocUnsafe(8 + record.trySize().throw(t)).throw(t))
      premac.tryWriteUint64(sequence).throw(t)
      record.tryWrite(premac).throw(t)

      const mac = await encrypter.macher.tryWrite(premac.bytes).then(r => r.throw(t))

      const length = content.length + mac.length
      const padding_length = modulup(length + 1, 16)
      const padding = Bytes.allocUnsafe(padding_length + 1)
      padding.fill(padding_length)

      const plaintext = Bytes.concat([content, mac, padding])
      const ciphertext = await encrypter.tryEncrypt(iv, plaintext).then(r => r.throw(t))

      // console.debug("-> iv", iv.length, Bytes.toHex(iv))
      // console.debug("-> plaintext", plaintext.length, Bytes.toHex(plaintext))
      // console.debug("-> content", content.length, Bytes.toHex(content))
      // console.debug("-> mac", mac.length, Bytes.toHex(mac))
      // console.debug("-> ciphertext", ciphertext.length, Bytes.toHex(ciphertext))

      return new Ok(new GenericBlockCipher(iv, ciphertext))
    })
  }

  async tryDecrypt(record: BlockCiphertextRecord, encrypter: BlockEncrypter, sequence: bigint): Promise<Result<Opaque, CryptoError>> {
    return await Result.unthrow(async t => {
      const plaintext = await encrypter.tryDecrypt(this.iv, this.block).then(r => r.throw(t))

      const content = plaintext.subarray(0, -encrypter.macher.mac_length)
      const mac = plaintext.subarray(-encrypter.macher.mac_length)

      // console.debug("<- content", content.length, Bytes.toHex(content))
      // console.debug("<- mac", mac.length, Bytes.toHex(mac))

      return new Ok(new Opaque(content))
    })
  }

}