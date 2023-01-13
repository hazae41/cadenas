import { Secrets } from "mods/ciphers/secrets.js"

export class AES_256_CBC {
  readonly #class = AES_256_CBC

  static enc_key_length = 32
  static fixed_iv_length = 16
  static block_length = 16

  constructor(
    readonly encryption: CryptoKey,
    readonly decryption: CryptoKey
  ) { }

  static async init(secrets: Secrets) {
    const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 256 }, false, ["encrypt"])
    const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-CBC", length: 256 }, false, ["decrypt"])

    return new this(encryption, decryption)
  }

  get class() {
    return this.#class
  }

  async encrypt(iv: Uint8Array, block: Uint8Array) {
    const pkcs7 = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", length: 256, iv }, this.encryption, block))

    return pkcs7.subarray(0, -16)
  }

  async decrypt(iv: Uint8Array, block: Uint8Array) {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", length: 256, iv }, this.decryption, block))
  }
}