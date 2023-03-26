import { ServerECDHParams } from "index.js"

export class Secp256r1 {

  async diffie_hellman(server_ecdh_params: ServerECDHParams) {
    const yc = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"])
    const ecdh_Yc = new Uint8Array(await crypto.subtle.exportKey("raw", yc.publicKey))

    const ecdh_Ys = server_ecdh_params.public_point.point.value.bytes
    const Ys = await crypto.subtle.importKey("raw", ecdh_Ys, { name: "ECDH", namedCurve: "P-256" }, false, [])
    const ecdh_Z = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: Ys }, yc.privateKey, 256))

    return { ecdh_Yc, ecdh_Z }
  }

}