import { Result } from "@hazae41/result"
import { CryptoError } from "libs/crypto/crypto.js"
import { Secrets } from "mods/ciphers/secrets.js"

export interface Hash {
  readonly mac: Mac
  readonly mac_length: number
  readonly mac_key_length: number

  readonly handshake_md: AlgorithmIdentifier
  readonly prf_md: AlgorithmIdentifier
}

export interface Mac {
  readonly mac_length: number
  readonly mac_key_length: number

  tryInit(secrets: Secrets): Promise<Result<Macher, CryptoError>>
}

export interface Macher {
  readonly mac_length: number
  readonly mac_key_length: number

  tryWrite(seed: Uint8Array): Promise<Result<Uint8Array, CryptoError>>
}