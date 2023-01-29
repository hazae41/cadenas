import { Binary } from "@hazae41/binary"
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

    const params = ServerECDHParams.read(binary)
    const signed_params = DigitallySigned.read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(params, signed_params)
  }
}