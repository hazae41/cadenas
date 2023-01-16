import { Secrets } from "mods/ciphers/secrets.js"

export class AES_128_GCM {
  readonly #class = AES_128_GCM

  static cipher_type = "aead" as const
  static enc_key_length = 16
  static fixed_iv_length = 4
  static record_iv_length = 8
  static block_length = 16

  constructor(
    readonly encryption_key: CryptoKey,
    readonly decryption_key: CryptoKey
  ) { }

  static async init(secrets: Secrets) {
    const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-GCM", length: 128 }, false, ["encrypt"])
    const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-GCM", length: 128 }, false, ["decrypt"])

    return new this(encryption, decryption)
  }

  get class() {
    return this.#class
  }

  get cipher_type() {
    return this.#class.cipher_type
  }

  async encrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array) {
    const pkcs7 = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", length: 128, iv: nonce, additionalData }, this.encryption_key, block))

    return pkcs7.subarray(0, -16)
  }

  async decrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array) {
    const pkcs7 = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", length: 128, iv: nonce, additionalData }, this.decryption_key, block))

    return pkcs7.subarray(0, -1)
  }
}