import { Secrets } from "mods/ciphers/secrets.js"

export interface Hash {
  readonly mac: Mac
  readonly mac_length: number
  readonly mac_key_length: number
}

export interface Mac {
  readonly mac_length: number
  readonly mac_key_length: number

  init(secrets: Secrets): Promise<Macher>
}

export interface Macher {
  readonly mac_length: number
  readonly mac_key_length: number

  write(seed: Uint8Array): Promise<Uint8Array>
}