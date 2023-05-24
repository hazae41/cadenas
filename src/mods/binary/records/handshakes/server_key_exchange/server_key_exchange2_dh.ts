import { BinaryReadError, BinaryWriteError } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Result } from "@hazae41/result"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ServerDHParams } from "mods/binary/records/handshakes/server_key_exchange/server_dh_params.js"

export class ServerKeyExchange2DH {

  static readonly type = Handshake.types.server_key_exchange

  constructor(
    readonly params: ServerDHParams
  ) { }

  static new(params: ServerDHParams) {
    return new ServerKeyExchange2DH(params)
  }

  trySize(): Result<number, never> {
    return this.params.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.params.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<ServerKeyExchange2DH, BinaryReadError> {
    return ServerDHParams.tryRead(cursor).mapSync(ServerKeyExchange2DH.new)
  }

}