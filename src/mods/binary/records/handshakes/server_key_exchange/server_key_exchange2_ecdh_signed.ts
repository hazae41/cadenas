import { Cursor } from "@hazae41/cursor"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { DigitallySigned } from "mods/binary/signatures/digitally_signed.js"
import { ServerECDHParams } from "./server_ecdh_params.js"

export class ServerKeyExchange2ECDHSigned {

  static readonly type = Handshake.types.server_key_exchange

  constructor(
    readonly params: ServerECDHParams,
    readonly signed_params: DigitallySigned
  ) { }

  sizeOrThrow() {
    return this.params.sizeOrThrow() + this.signed_params.sizeOrThrow()
  }

  writeOrThrow(cursor: Cursor) {
    this.params.writeOrThrow(cursor)
    this.signed_params.writeOrThrow(cursor)
  }

  static readOrThrow(cursor: Cursor) {
    const params = ServerECDHParams.readOrThrow(cursor)
    const signed_params = DigitallySigned.readOrThrow(cursor)

    return new ServerKeyExchange2ECDHSigned(params, signed_params)
  }

}