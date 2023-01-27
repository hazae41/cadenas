import { Hash, Macher } from "mods/ciphers/hashes/hash.js"
import { Secrets } from "mods/ciphers/secrets.js"

export type Encryption =
  | BlockEncryption
  | AEADEncryption

export interface BlockEncryption {
  readonly cipher_type: "block"
  readonly enc_key_length: number
  readonly fixed_iv_length: number
  readonly record_iv_length: number

  init(secrets: Secrets, hash: Hash): Promise<BlockEncrypter>
}

export interface AEADEncryption {
  readonly cipher_type: "aead"
  readonly enc_key_length: number
  readonly fixed_iv_length: number
  readonly record_iv_length: number

  init(secrets: Secrets): Promise<AEADEncrypter>
}

export type Encrypter =
  | BlockEncrypter
  | AEADEncrypter

export interface BlockEncrypter {
  readonly class: BlockEncryption

  readonly cipher_type: "block"
  readonly macher: Macher

  encrypt(iv: Uint8Array, block: Uint8Array): Promise<Uint8Array>
  decrypt(iv: Uint8Array, block: Uint8Array): Promise<Uint8Array>
}

export interface AEADEncrypter {
  readonly class: AEADEncryption

  readonly cipher_type: "aead"
  readonly secrets: Secrets

  encrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Uint8Array>
  decrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Uint8Array>
}