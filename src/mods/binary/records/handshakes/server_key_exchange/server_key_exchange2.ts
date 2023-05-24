import { Ok, Panic, Result } from "@hazae41/result"
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

export type ReadableServerKeyExchange2 =
  | typeof ServerKeyExchange2DH
  | typeof ServerKeyExchange2DHSigned
  | typeof ServerKeyExchange2ECDHSigned

export namespace ReadableServerKeyExchange2 {

  export function tryGet(cipher: Cipher): Result<ReadableServerKeyExchange2, never> {
    if (cipher.key_exchange === DHE_RSA)
      return new Ok(ServerKeyExchange2DHSigned)
    if (cipher.key_exchange === ECDHE_RSA)
      return new Ok(ServerKeyExchange2ECDHSigned)

    throw new Panic(`Invalid key exchange`)
  }

}
