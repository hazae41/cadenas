import { Cipher } from "mods/ciphers/cipher.js"
import { DHE_RSA } from "mods/ciphers/key_exchanges/dhe_rsa/dhe_rsa.js"
import { ECDHE_RSA } from "mods/ciphers/key_exchanges/ecdhe_rsa/ecdhe_rsa.js"
import { ServerKeyExchange2DH } from "./server_key_exchange2_dh.js"
import { ServerKeyExchange2DHSigned } from "./server_key_exchange2_dh_signed.js"
import { ServerKeyExchange2ECDHSigned } from "./server_key_exchange2_ecdh_signed.js"

export type ServerKeyExchange2 =
  | ServerKeyExchange2DH
  | ServerKeyExchange2DHSigned
  | ServerKeyExchange2ECDHSigned

export function getServerKeyExchange2(cipher: Cipher) {
  if (cipher.key_exchange === DHE_RSA)
    return ServerKeyExchange2DHSigned
  if (cipher.key_exchange === ECDHE_RSA)
    return ServerKeyExchange2ECDHSigned
  throw new Error(`Unsupported key exchange`)
}