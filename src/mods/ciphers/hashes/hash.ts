export interface Hash {
  readonly name: string

  readonly mac_key_length: number
}

export interface Hasher {
  mac(seed: Uint8Array): Promise<Uint8Array>
}