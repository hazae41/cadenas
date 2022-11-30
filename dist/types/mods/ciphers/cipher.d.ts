type KeyExchangeAlgorithmName = ClassicKeyExchangeAlgorithmName | EllipticKeyExchangeAlgorithmName;
type ClassicKeyExchangeAlgorithmName = "dhe_dss" | "dhe_rsa" | "dh_anon" | "rsa" | "dh_dss" | "dh_rsa";
type EllipticKeyExchangeAlgorithmName = "ecdh_ecdsa" | "ecdhe_ecdsa" | "ecdh_rsa" | "ecdhe_rsa" | "ecdh_anon";
type EncryptionAlgorithmName = "aes_128_cbc" | "aes_256_cbc" | "3des_ede_cbc" | "aes_128_gcm" | "aes_256_gcm";
type HashAlgorithmName = "sha" | "sha256";
declare class CipherSuite {
    readonly id: number;
    readonly key_exchange: KeyExchangeAlgorithmName;
    readonly encryption: EncryptionAlgorithmName;
    readonly hash: HashAlgorithmName;
    constructor(id: number, key_exchange: KeyExchangeAlgorithmName, encryption: EncryptionAlgorithmName, hash: HashAlgorithmName);
    get ephemeral(): boolean;
    get anonymous(): boolean;
}

export { CipherSuite, ClassicKeyExchangeAlgorithmName, EllipticKeyExchangeAlgorithmName, EncryptionAlgorithmName, HashAlgorithmName, KeyExchangeAlgorithmName };
