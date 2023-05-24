import { Cursor } from "@hazae41/cursor";
import { ECPoint } from "../server_key_exchange/ec_point.js";

export class ClientECDiffieHellmanPublic {

  constructor(
    readonly ecdh_Yc: ECPoint
  ) { }

  static from(bytes: Uint8Array) {
    const ecdh_Yc = ECPoint.from(bytes)

    return new this(ecdh_Yc)
  }

  trySize() {
    return this.ecdh_Yc.size()
  }

  write(cursor: Cursor) {
    this.ecdh_Yc.write(cursor)
  }

  static read(cursor: Cursor) {
    const ecdh_Yc = ECPoint.read(cursor)

    return new this(ecdh_Yc)
  }
}