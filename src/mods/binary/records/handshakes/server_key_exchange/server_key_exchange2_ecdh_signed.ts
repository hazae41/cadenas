import { Cursor } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { DigitallySigned } from "mods/binary/signatures/digitally_signed.js"
import { ServerECDHParams } from "./server_ecdh_params.js"

export class ServerKeyExchange2ECDHSigned {

  static readonly type = Handshake.types.server_key_exchange

  constructor(
    readonly params: ServerECDHParams,
    readonly signed_params: DigitallySigned
  ) { }

  size() {
    return this.params.size() + this.signed_params.size()
  }

  write(cursor: Cursor) {
    this.params.write(cursor)
    this.signed_params.write(cursor)
  }

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset

    const params = ServerECDHParams.read(cursor)
    const signed_params = DigitallySigned.read(cursor)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(params, signed_params)
  }
}