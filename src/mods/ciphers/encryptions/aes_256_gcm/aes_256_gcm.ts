import { Secrets } from "mods/ciphers/secrets.js"

export class AES_256_GCM {
  readonly #class = AES_256_GCM

  static enc_key_length = 32
  static fixed_iv_length = 4
  static record_iv_length = 8
  static block_length = 16

  constructor(
    readonly encryption_key: CryptoKey,
    readonly decryption_key: CryptoKey
  ) { }

  static async init(secrets: Secrets) {
    const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-GCM", length: 256 }, false, ["encrypt"])
    const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-GCM", length: 256 }, false, ["decrypt"])

    return new this(encryption, decryption)
  }

  get class() {
    return this.#class
  }

  async encrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array) {
    const pkcs7 = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", length: 256, iv: nonce, additionalData }, this.encryption_key, block))

    return pkcs7.subarray(0, -16)
  }

  async decrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array) {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", length: 256, iv: nonce, additionalData }, this.decryption_key, block))
  }
}