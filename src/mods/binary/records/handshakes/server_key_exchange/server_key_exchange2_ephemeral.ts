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

  size() {
    return this.params.size() + this.signed_params.size()
  }

  write(binary: Binary) {
    this.params.write(binary)
    this.signed_params.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
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