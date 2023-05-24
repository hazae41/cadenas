import { Err, Ok, Result } from "@hazae41/result";
import { ClientKeyExchange2DH } from "mods/binary/records/handshakes/client_key_exchange/client_key_exchange2_dh.js";
import { Cipher } from "mods/ciphers/cipher.js";
import { DHE_RSA } from "mods/ciphers/key_exchanges/dhe_rsa/dhe_rsa.js";
import { ECDHE_RSA } from "mods/ciphers/key_exchanges/ecdhe_rsa/ecdhe_rsa.js";
import { ClientKeyExchange2ECDH } from "./client_key_exchange2_ecdh.js";

export type ClientKeyExchange2 =
  | ClientKeyExchange2DH
  | ClientKeyExchange2ECDH

export type ReadableClientKeyExchange2 =
  | typeof ClientKeyExchange2DH
  | typeof ClientKeyExchange2ECDH

export namespace ReadableClientKeyExchange2 {

  export function tryGet(cipher: Cipher): Result<ReadableClientKeyExchange2, unknown> {
    if (cipher.key_exchange === DHE_RSA)
      return new Ok(ClientKeyExchange2DH)
    if (cipher.key_exchange === ECDHE_RSA)
      return new Ok(ClientKeyExchange2ECDH)

    return new Err(new Error(`Unsupported key exchange`))
  }

}