import { Result } from "@hazae41/result"
import { CryptoError } from "libs/crypto/crypto.js"
import { AEADEncrypter, BlockEncrypter, Encryption } from "mods/ciphers/encryptions/encryption.js"
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

  async tryInit(secrets: Secrets): Promise<Result<BlockEncrypter | AEADEncrypter, CryptoError>> {
    const { hash } = this

    if (this.encryption.cipher_type === "block")
      return await this.encryption.tryInit(secrets, hash.mac)
    else
      return await this.encryption.tryInit(secrets)
  }
}

