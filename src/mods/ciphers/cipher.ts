import { AEADEncrypter, BlockEncrypter, Encryption } from "mods/ciphers/encryptions/encryption.js"
import { Hash, Hasher } from "mods/ciphers/hashes/hash.js"
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
    const encrypter = await this.encryption.init(secrets)
    const hasher = await this.hash.init(secrets)
    return { encrypter, hasher, secrets } satisfies Cipherer
  }
}

export type Cipherer =
  | BlockCipherer
  | AEADCipherer

export interface BlockCipherer {
  readonly encrypter: BlockEncrypter,
  readonly hasher: Hasher,
  readonly secrets: Secrets,
}

export interface AEADCipherer {
  readonly encrypter: AEADEncrypter,
  readonly hasher: Hasher,
  readonly secrets: Secrets,
}