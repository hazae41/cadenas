export interface Encryption {
  readonly name: string

  readonly enc_key_length: number
  readonly fixed_iv_length: number
  readonly record_iv_length: number
}

export interface BlockEncrypter {
  class: Encryption

  encrypt(iv: Uint8Array, block: Uint8Array): Promise<Uint8Array>
  decrypt(iv: Uint8Array, block: Uint8Array): Promise<Uint8Array>
}

export interface AEADEncrypter {
  class: Encryption

  encrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Uint8Array>
  decrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Uint8Array>
}