import { BlockEncrypter, Encryption } from "mods/ciphers/encryptions/encryption.js"
import { Hash, Hasher } from "mods/ciphers/hashes/hash.js"
import { KeyExchange } from "mods/ciphers/key_exchanges/key_exchange.js"

export class Cipher {
  constructor(
    readonly id: number,
    readonly key_exchange: KeyExchange,
    readonly encryption: Encryption,
    readonly hash: Hash
  ) { }
}

export class Cipherer {
  constructor(
    readonly encrypter: BlockEncrypter,
    readonly hasher: Hasher
  ) { }
}
