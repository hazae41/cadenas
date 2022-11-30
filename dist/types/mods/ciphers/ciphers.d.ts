import { CipherSuite } from './cipher.js';

/**
 * Legacy ciphers
 */
declare const TLS_DHE_RSA_WITH_AES_256_CBC_SHA: CipherSuite;
declare const TLS_DHE_RSA_WITH_AES_128_CBC_SHA: CipherSuite;
declare const TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA: CipherSuite;
/**
 * Modern ciphers
 */
declare const TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256: CipherSuite;

export { TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA, TLS_DHE_RSA_WITH_AES_128_CBC_SHA, TLS_DHE_RSA_WITH_AES_256_CBC_SHA, TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 };
