import { Ok, Result } from "@hazae41/result"
import { CryptoError, tryCrypto } from "libs/crypto/crypto.js"
import { Mac, Macher } from "mods/ciphers/hashes/hash.js"
import { Secrets } from "mods/ciphers/secrets.js"

export class AES_128_CBC {
  readonly #class = AES_128_CBC

  static readonly cipher_type = "block" as const
  static readonly enc_key_length = 16 as const
  static readonly block_length = 16 as const
  static readonly fixed_iv_length = this.block_length
  static readonly record_iv_length = this.block_length

  constructor(
    readonly macher: Macher,
    readonly encryption_key: CryptoKey,
    readonly decryption_key: CryptoKey
  ) { }

  static async tryInit(secrets: Secrets, mac: Mac): Promise<Result<AES_128_CBC, CryptoError>> {
    return await Result.unthrow(async t => {
      const macher = await mac.tryInit(secrets).then(r => r.throw(t))

      const encryption = await tryCrypto(async () => {
        return await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 128 }, false, ["encrypt"])
      }).then(r => r.throw(t))

      const decryption = await tryCrypto(async () => {
        return await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-CBC", length: 128 }, false, ["decrypt"])
      }).then(r => r.throw(t))

      return new Ok(new AES_128_CBC(macher, encryption, decryption))
    })
  }

  get cipher_type() {
    return this.#class.cipher_type
  }

  get enc_key_length() {
    return this.#class.enc_key_length
  }

  get block_length() {
    return this.#class.block_length
  }

  get fixed_iv_length() {
    return this.#class.fixed_iv_length
  }

  get record_iv_length() {
    return this.#class.record_iv_length
  }

  async tryEncrypt(iv: Uint8Array, plaintext: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
    return await Result.unthrow(async t => {
      /**
      * The plaintext already has our own padding, but this will append a 16-bytes PKCS7 padding at the end...
      * 
      * [...plaintext, ...6 times 6, 6] => [...plaintext, ...6 times 6, 6, ...16*(16)]
      */
      const pkcs7 = await tryCrypto(async () => {
        return new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", iv }, this.encryption_key, plaintext))
      }).then(r => r.throw(t))

      /**
       * ...that we remove
       */
      return new Ok(pkcs7.subarray(0, -16))
    })
  }

  async tryDecrypt(iv: Uint8Array, ciphertext: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
    return await Result.unthrow(async t => {
      /**
      * The plaintext has our own padding, but this will strip the padding as PKCS7, so it will leave one byte at the end...
      * 
      * [...plaintext, ...6 times 6, 6] => [...plaintext, 06]
      */
      const unpkcs7 = await tryCrypto(async () => {
        return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", iv }, this.decryption_key, ciphertext))
      }).then(r => r.throw(t))

      /**
       * ...that we remove
       */
      return new Ok(unpkcs7.subarray(0, -1))
    })
  }
}