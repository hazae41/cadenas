import { BinaryReadError, BinaryWriteError } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { DigitallySigned } from "mods/binary/signatures/digitally_signed.js"
import { ServerECDHParams } from "./server_ecdh_params.js"

export class ServerKeyExchange2ECDHSigned {

  static readonly type = Handshake.types.server_key_exchange

  constructor(
    readonly params: ServerECDHParams,
    readonly signed_params: DigitallySigned
  ) { }

  trySize(): Result<number, never> {
    return new Ok(0
      + this.params.trySize().get()
      + this.signed_params.trySize().get())
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      this.params.tryWrite(cursor).throw(t)
      this.signed_params.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<ServerKeyExchange2ECDHSigned, BinaryReadError> {
    return Result.unthrowSync(t => {
      const params = ServerECDHParams.tryRead(cursor).throw(t)
      const signed_params = DigitallySigned.tryRead(cursor).throw(t)

      return new Ok(new ServerKeyExchange2ECDHSigned(params, signed_params))
    })
  }

}