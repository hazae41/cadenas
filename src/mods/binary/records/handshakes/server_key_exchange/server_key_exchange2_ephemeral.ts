import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ServerDHParams } from "mods/binary/records/handshakes/server_key_exchange/server_dh_params.js"
import { DigitallySigned } from "mods/binary/signature.js"

export class ServerKeyExchange2Ephemeral {
  readonly #class = ServerKeyExchange2Ephemeral

  static type = Handshake.types.server_key_exchange

  constructor(
    readonly params: ServerDHParams,
    readonly signed_params: DigitallySigned
  ) { }

  get class() {
    return this.#class
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const params = ServerDHParams.read(binary)
    const signed_params = DigitallySigned.read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(params, signed_params)
  }
}