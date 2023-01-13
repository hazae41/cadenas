import { Secrets } from "mods/ciphers/secrets.js";

export class SHA {
  static mac_key_length = 20

  constructor(
    readonly mac_key: CryptoKey
  ) { }

  static async init(secrets: Secrets) {
    const mac_key = await crypto.subtle.importKey("raw", secrets.client_write_MAC_key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"])

    return new this(mac_key)
  }

  async mac(seed: Uint8Array) {
    return new Uint8Array(await crypto.subtle.sign("HMAC", this.mac_key, seed))
  }
}
