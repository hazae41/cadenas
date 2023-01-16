import { Secrets } from "mods/ciphers/secrets.js"

export type Encryption =
  | BlockEncryption
  | AEADEncryption

export interface IEncryption {
  readonly cipher_type: string
  readonly enc_key_length: number
  readonly fixed_iv_length: number
  readonly record_iv_length: number
}

export interface BlockEncryption extends IEncryption {
  init(secrets: Secrets): Promise<BlockEncrypter>
}

export interface AEADEncryption extends IEncryption {
  init(secrets: Secrets): Promise<AEADEncrypter>
}

export type Encrypter =
  | BlockEncrypter
  | AEADEncrypter

export interface BlockEncrypter {
  readonly class: BlockEncryption

  encrypt(iv: Uint8Array, block: Uint8Array): Promise<Uint8Array>
  decrypt(iv: Uint8Array, block: Uint8Array): Promise<Uint8Array>
}

export interface AEADEncrypter {
  readonly class: AEADEncryption

  encrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Uint8Array>
  decrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Uint8Array>
}