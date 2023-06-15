import { Ok, Result } from "@hazae41/result"
import { CryptoError, tryCrypto } from "libs/crypto/crypto.js"
import { Secrets } from "mods/ciphers/secrets.js"

export class HMAC_SHA256 {
  readonly #class = HMAC_SHA256

  static readonly mac_length = 32 as const
  static readonly mac_key_length = 32 as const

  constructor(
    readonly mac_key: CryptoKey
  ) { }

  get mac_length() {
    return this.#class.mac_length
  }

  get mac_key_length() {
    return this.#class.mac_key_length
  }

  static async tryInit(secrets: Secrets): Promise<Result<HMAC_SHA256, CryptoError>> {
    return await Result.unthrow(async t => {
      const mac_key = await tryCrypto(async () => {
        return await crypto.subtle.importKey("raw", secrets.client_write_MAC_key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
      }).then(r => r.throw(t))

      return new Ok(new HMAC_SHA256(mac_key))
    })
  }

  async tryWrite(seed: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
    return await tryCrypto(async () => new Uint8Array(await crypto.subtle.sign("HMAC", this.mac_key, seed)))
  }

}

export class SHA256 {
  readonly #class = SHA256

  static readonly mac = HMAC_SHA256
  static readonly mac_length = 32 as const
  static readonly mac_key_length = 32 as const

  static readonly handshake_md = "SHA-256" as const
  static readonly prf_md = "SHA-256" as const

  constructor() { }

  get mac_length() {
    return this.#class.mac_length
  }

  get mac_key_length() {
    return this.#class.mac_key_length
  }
}
