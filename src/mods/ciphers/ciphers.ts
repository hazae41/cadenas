import { CipherSuite } from "mods/ciphers/cipher.js"

/**
 * Legacy ciphers
 */
export const TLS_DHE_RSA_WITH_AES_256_CBC_SHA = new CipherSuite(0x0039, "dhe_rsa", "aes_256_cbc", "sha")
export const TLS_DHE_RSA_WITH_AES_128_CBC_SHA = new CipherSuite(0x0033, "dhe_rsa", "aes_128_cbc", "sha")
export const TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA = new CipherSuite(0x0016, "dhe_rsa", "3des_ede_cbc", "sha")

/**
 * Modern ciphers
 */
export const TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 = new CipherSuite(0xC02B, "ecdhe_ecdsa", "aes_128_gcm", "sha256")