import { ClientKeyExchange2DH } from "mods/binary/records/handshakes/client_key_exchange/client_key_exchange2_dh.js";
import { Cipher } from "mods/ciphers/cipher.js";
import { DHE_RSA } from "mods/ciphers/key_exchanges/dhe_rsa/dhe_rsa.js";
import { ECDHE_RSA } from "mods/ciphers/key_exchanges/ecdhe_rsa/ecdhe_rsa.js";
import { ClientKeyExchange2ECDH } from "./client_key_exchange2_ecdh.js";

export type ClientKeyExchange2 =
  | ClientKeyExchange2DH


export function getClientKeyExchange2(cipher: Cipher) {
  if (cipher.key_exchange === DHE_RSA)
    return ClientKeyExchange2DH
  if (cipher.key_exchange === ECDHE_RSA)
    return ClientKeyExchange2ECDH
  throw new Error(`Unsupported key exchange`)
}