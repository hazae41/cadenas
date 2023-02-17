import { Cursor } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ServerDHParams } from "mods/binary/records/handshakes/server_key_exchange/server_dh_params.js"

export class ServerKeyExchange2DH {

  static readonly type = Handshake.types.server_key_exchange

  constructor(
    readonly params: ServerDHParams
  ) { }

  size() {
    return this.params.size()
  }

  write(cursor: Cursor) {
    this.params.write(cursor)
  }

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset

    const params = ServerDHParams.read(cursor)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(params)
  }
}