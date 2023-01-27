import { Hash, Macher } from "mods/ciphers/hashes/hash.js"
import { Secrets } from "mods/ciphers/secrets.js"

export class AES_256_CBC {
  readonly #class = AES_256_CBC

  static cipher_type = "block" as const
  static enc_key_length = 32
  static fixed_iv_length = 16
  static record_iv_length = 16
  static block_length = 16

  constructor(
    readonly macher: Macher,
    readonly encryption_key: CryptoKey,
    readonly decryption_key: CryptoKey
  ) { }

  static async init(secrets: Secrets, hash: Hash) {
    const macher = await hash.mac.init(secrets)

    const encryption = await crypto.subtle.importKey("raw", secrets.client_write_key, { name: "AES-CBC", length: 256 }, false, ["encrypt"])
    const decryption = await crypto.subtle.importKey("raw", secrets.server_write_key, { name: "AES-CBC", length: 256 }, false, ["decrypt"])

    return new this(macher, encryption, decryption)
  }

  get class() {
    return this.#class
  }

  get cipher_type() {
    return this.#class.cipher_type
  }

  async encrypt(iv: Uint8Array, block: Uint8Array) {
    const pkcs7 = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", length: 256, iv }, this.encryption_key, block))

    return pkcs7.subarray(0, -16)
  }

  async decrypt(iv: Uint8Array, block: Uint8Array) {
    const pkcs7 = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", length: 256, iv }, this.decryption_key, block))

    return pkcs7.subarray(0, -1)
  }
}