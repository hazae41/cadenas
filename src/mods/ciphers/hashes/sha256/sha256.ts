import { Secrets } from "mods/ciphers/secrets.js"

export class HMAC_SHA256 {
  static mac_length = 32
  static mac_key_length = 32

  constructor(
    readonly mac_key: CryptoKey
  ) { }

  static async init(secrets: Secrets) {
    const mac_key = await crypto.subtle.importKey("raw", secrets.client_write_MAC_key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

    return new this(mac_key)
  }

  async write(seed: Uint8Array) {
    return new Uint8Array(await crypto.subtle.sign("HMAC", this.mac_key, seed))
  }
}

export class SHA256 {
  static mac = HMAC_SHA256
  static mac_length = 32
  static mac_key_length = 32

  constructor() { }
}
