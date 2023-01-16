import { Secrets } from "mods/ciphers/secrets.js"

export interface Hash {
  readonly mac_key_length: number

  init(secrets: Secrets): Promise<Hasher>
}

export interface Hasher {
  mac(seed: Uint8Array): Promise<Uint8Array>
}