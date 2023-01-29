import { Binary } from "@hazae41/binary";
import { ECPoint } from "../server_key_exchange/ec_point.js";

export class ClientECDiffieHellmanPublic {

  constructor(
    readonly ecdh_Yc: ECPoint
  ) { }

  static from(bytes: Uint8Array) {
    const ecdh_Yc = ECPoint.from(bytes)

    return new this(ecdh_Yc)
  }

  size() {
    return this.ecdh_Yc.size()
  }

  write(binary: Binary) {
    this.ecdh_Yc.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    const ecdh_Yc = ECPoint.read(binary)

    return new this(ecdh_Yc)
  }
}