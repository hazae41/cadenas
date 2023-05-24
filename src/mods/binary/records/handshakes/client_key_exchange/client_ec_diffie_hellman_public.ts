import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { ECPoint } from "../server_key_exchange/ec_point.js";

export class ClientECDiffieHellmanPublic {

  constructor(
    readonly ecdh_Yc: ECPoint
  ) { }

  static new(ecdh_Yc: ECPoint) {
    return new ClientECDiffieHellmanPublic(ecdh_Yc)
  }

  static from(bytes: Uint8Array) {
    return new ClientECDiffieHellmanPublic(ECPoint.from(bytes))
  }

  trySize(): Result<number, never> {
    return this.ecdh_Yc.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.ecdh_Yc.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<ClientECDiffieHellmanPublic, BinaryReadError> {
    return ECPoint.tryRead(cursor).mapSync(ClientECDiffieHellmanPublic.new)
  }

}