import { Ok, Result } from "@hazae41/result"
import { ServerECDHParams } from "index.js"
import { CryptoError, tryCrypto } from "libs/crypto/crypto.js"

export interface ECDH {
  ecdh_Yc: Uint8Array
  ecdh_Z: Uint8Array
}

export class Secp256r1 {

  async diffie_hellman(server_ecdh_params: ServerECDHParams): Promise<Result<ECDH, CryptoError>> {
    return await Result.unthrow(async t => {
      const yc = await tryCrypto(async () => {
        return await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"])
      }).then(r => r.throw(t))

      const ecdh_Yc = await tryCrypto(async () => {
        return new Uint8Array(await crypto.subtle.exportKey("raw", yc.publicKey))
      }).then(r => r.throw(t))

      const ecdh_Ys = server_ecdh_params.public_point.point.value.bytes

      const Ys = await tryCrypto(async () => {
        return await crypto.subtle.importKey("raw", ecdh_Ys, { name: "ECDH", namedCurve: "P-256" }, false, [])
      }).then(r => r.throw(t))

      const ecdh_Z = await tryCrypto(async () => {
        return new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: Ys }, yc.privateKey, 256))
      }).then(r => r.throw(t))

      return new Ok({ ecdh_Yc, ecdh_Z })
    })
  }

}