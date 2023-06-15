import { Ok, Result } from "@hazae41/result"
import { CryptoError, tryCrypto } from "libs/crypto/crypto.js"
import { Secrets } from "mods/ciphers/secrets.js"

export class AES_128_GCM {
  readonly #class = AES_128_GCM

  static readonly cipher_type = "aead" as const
  static readonly enc_key_length = 16 as const
  static readonly block_length = 16 as const
  static readonly fixed_iv_length = 4 as const
  static readonly record_iv_length = 8 as const

  constructor(
    readonly secrets: Secrets, // TODO
    readonly encryption_key: CryptoKey,
    readonly decryption_key: CryptoKey,
  ) { }

  static async tryInit(secrets: Secrets): Promise<Result<AES_128_GCM, CryptoError>> {
    return await Result.unthrow(async t => {
      const encryption = await tryCrypto(async () => {
        return await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-GCM", length: 128 }, false, ["encrypt"])
      }).then(r => r.throw(t))

      const decryption = await tryCrypto(async () => {
        return await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-GCM", length: 128 }, false, ["decrypt"])
      }).then(r => r.throw(t))

      return new Ok(new AES_128_GCM(secrets, encryption, decryption))
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

  async tryEncrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
    return await tryCrypto(async () => new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", length: 128, iv: nonce, additionalData }, this.encryption_key, block)))
  }

  async tryDecrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
    return await tryCrypto(async () => new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", length: 128, iv: nonce, additionalData }, this.decryption_key, block)))
  }

}