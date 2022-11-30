export type KeyExchangeAlgorithmName =
  | ClassicKeyExchangeAlgorithmName
  | EllipticKeyExchangeAlgorithmName

export type ClassicKeyExchangeAlgorithmName =
  | "dhe_dss"
  | "dhe_rsa"
  | "dh_anon"
  | "rsa"
  | "dh_dss"
  | "dh_rsa"

export type EllipticKeyExchangeAlgorithmName =
  | "ecdh_ecdsa"
  | "ecdhe_ecdsa"
  | "ecdh_rsa"
  | "ecdhe_rsa"
  | "ecdh_anon"

export type EncryptionAlgorithmName =
  | "aes_128_cbc"
  | "aes_256_cbc"
  | "3des_ede_cbc"
  | "aes_128_gcm"
  | "aes_256_gcm"

export type HashAlgorithmName =
  | "sha"
  | "sha256"

export class CipherSuite {
  constructor(
    readonly id: number,
    readonly key_exchange: KeyExchangeAlgorithmName,
    readonly encryption: EncryptionAlgorithmName,
    readonly hash: HashAlgorithmName
  ) { }

  get ephemeral() {
    const list: KeyExchangeAlgorithmName[] = [
      "dhe_dss",
      "dhe_rsa",
      "ecdhe_ecdsa",
      "ecdhe_rsa"
    ]

    return list.includes(this.key_exchange)
  }

  get anonymous() {
    const list: KeyExchangeAlgorithmName[] = [
      "dh_anon",
      "ecdh_anon"
    ]

    return list.includes(this.key_exchange)
  }
}