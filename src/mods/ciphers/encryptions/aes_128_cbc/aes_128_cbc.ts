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

  static async init(secrets: Secrets, mac: Mac) {
    const macher = await mac.init(secrets)

    const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 128 }, false, ["encrypt"])
    const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-CBC", length: 128 }, false, ["decrypt"])

    return new this(macher, encryption, decryption)
  }

  get class() {
    return this.#class
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

  async encrypt(iv: Uint8Array, block: Uint8Array) {
    const pkcs7 = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", length: 128, iv }, this.encryption_key, block))

    return pkcs7.subarray(0, -16)
  }

  async decrypt(iv: Uint8Array, block: Uint8Array) {
    const pkcs7 = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", length: 128, iv }, this.decryption_key, block))

    return pkcs7.subarray(0, -1)
  }
}