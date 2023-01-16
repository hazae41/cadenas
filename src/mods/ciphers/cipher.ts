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
}

export class BlockCipherer {
  constructor(
    readonly encrypter: BlockEncrypter,
    readonly hasher: Hasher,
    readonly secrets: Secrets
  ) { }
}

export class AEADCipherer {
  constructor(
    readonly encrypter: AEADEncrypter,
    readonly hasher: Hasher,
    readonly secrets: Secrets
  ) { }
}
