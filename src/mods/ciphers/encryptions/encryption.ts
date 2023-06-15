import { Result } from "@hazae41/result"
import { CryptoError } from "libs/crypto/crypto.js"
import { Mac, Macher } from "mods/ciphers/hashes/hash.js"
import { Secrets } from "mods/ciphers/secrets.js"

export type Encryption =
  | BlockEncryption
  | AEADEncryption

export interface BlockEncryption {
  readonly cipher_type: "block"
  readonly enc_key_length: number
  readonly fixed_iv_length: number
  readonly record_iv_length: number

  tryInit(secrets: Secrets, mac: Mac): Promise<Result<BlockEncrypter, CryptoError>>
}

export interface AEADEncryption {
  readonly cipher_type: "aead"
  readonly enc_key_length: number
  readonly fixed_iv_length: number
  readonly record_iv_length: number

  tryInit(secrets: Secrets): Promise<Result<AEADEncrypter, CryptoError>>
}

export type Encrypter =
  | BlockEncrypter
  | AEADEncrypter

export interface BlockEncrypter {
  readonly cipher_type: "block"
  readonly enc_key_length: number
  readonly fixed_iv_length: number
  readonly record_iv_length: number

  readonly macher: Macher

  tryEncrypt(iv: Uint8Array, block: Uint8Array): Promise<Result<Uint8Array, CryptoError>>
  tryDecrypt(iv: Uint8Array, block: Uint8Array): Promise<Result<Uint8Array, CryptoError>>
}

export interface AEADEncrypter {
  readonly cipher_type: "aead"
  readonly enc_key_length: number
  readonly fixed_iv_length: number
  readonly record_iv_length: number

  readonly secrets: Secrets

  tryEncrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Result<Uint8Array, CryptoError>>
  tryDecrypt(nonce: Uint8Array, block: Uint8Array, additionalData: Uint8Array): Promise<Result<Uint8Array, CryptoError>>
}