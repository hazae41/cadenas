import { ClientKeyExchange2DH } from "mods/binary/handshakes/client_key_exchange/client_key_exchange2_dh.js";
import { ClientKeyExchange2RSA } from "mods/binary/handshakes/client_key_exchange/client_key_exchange2_rsa.js";
import { CipherSuite } from "mods/ciphers/cipher.js";

export type ClientKeyExchange2 =
  | ClientKeyExchange2RSA
  | ClientKeyExchange2DH

export function getClientKeyExchange2(cipher: CipherSuite) {
  if (cipher.key_exchange === "rsa")
    return ClientKeyExchange2RSA
  return ClientKeyExchange2DH
}