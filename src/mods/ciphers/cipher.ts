import { Encryption } from "mods/ciphers/encryptions/encryption.js"
import { Hash } from "mods/ciphers/hashes/hash.js"
import { KeyExchange } from "mods/ciphers/key_exchanges/key_exchange.js"
import { Secrets } from "mods/ciphers/secrets.js"

export class Cipher {
  constructor(
    readonly id: number,
    readonly key_exchange: KeyExchange,
    readonly encryption: Encryption,
    readonly hash: Hash
  ) { }

  async init(secrets: Secrets) {
    const { hash } = this

    if (this.encryption.cipher_type === "block")
      return await this.encryption.init(secrets, hash.mac)
    else
      return await this.encryption.init(secrets)
  }
}

