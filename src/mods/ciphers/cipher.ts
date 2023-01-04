import { Encryption } from "mods/ciphers/encryptions/encryption.js"
import { Hash } from "mods/ciphers/hashes/hash.js"
import { KeyExchange } from "mods/ciphers/key_exchanges/key_exchange.js"

export class CipherSuite {
  constructor(
    readonly id: number,
    readonly key_exchange: KeyExchange,
    readonly encryption: Encryption,
    readonly hash: Hash
  ) { }
}
