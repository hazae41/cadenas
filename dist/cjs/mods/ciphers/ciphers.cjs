'use strict';

var cipher = require('./cipher.cjs');

/**
 * Legacy ciphers
 */
const TLS_DHE_RSA_WITH_AES_256_CBC_SHA = new cipher.CipherSuite(0x0039, "dhe_rsa", "aes_256_cbc", "sha");
const TLS_DHE_RSA_WITH_AES_128_CBC_SHA = new cipher.CipherSuite(0x0033, "dhe_rsa", "aes_128_cbc", "sha");
const TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA = new cipher.CipherSuite(0x0016, "dhe_rsa", "3des_ede_cbc", "sha");
/**
 * Modern ciphers
 */
const TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 = new cipher.CipherSuite(0xC02B, "ecdhe_ecdsa", "aes_128_gcm", "sha256");

exports.TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA = TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA;
exports.TLS_DHE_RSA_WITH_AES_128_CBC_SHA = TLS_DHE_RSA_WITH_AES_128_CBC_SHA;
exports.TLS_DHE_RSA_WITH_AES_256_CBC_SHA = TLS_DHE_RSA_WITH_AES_256_CBC_SHA;
exports.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 = TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256;
//# sourceMappingURL=ciphers.cjs.map
