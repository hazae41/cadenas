export interface Encryption {
  readonly name: string

  readonly enc_key_length: number
  readonly fixed_iv_length: number
}

export interface BlockEncrypter {
  encrypt(iv: Uint8Array, block: Uint8Array): Promise<Uint8Array>
  decrypt(iv: Uint8Array, block: Uint8Array): Promise<Uint8Array>
}