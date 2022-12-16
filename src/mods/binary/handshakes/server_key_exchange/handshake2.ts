import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/handshakes/handshake.js"
import { Number16 } from "mods/binary/number.js"
import { DigitallySigned } from "mods/binary/signature.js"
import { BufferVector, Vector } from "mods/binary/vector.js"

export class ServerDHParams {
  readonly class = ServerDHParams

  constructor(
    readonly dh_p: Vector<Number16>,
    readonly dh_g: Vector<Number16>,
    readonly dh_Ys: Vector<Number16>
  ) { }

  static read(binary: Binary) {
    const dh_p = BufferVector<Number16>(Number16).read(binary)
    const dh_g = BufferVector<Number16>(Number16).read(binary)
    const dh_Ys = BufferVector<Number16>(Number16).read(binary)

    return new this(dh_p, dh_g, dh_Ys)
  }
}

export class ServerKeyExchange2Anonymous {
  readonly class = ServerKeyExchange2Anonymous

  static type = Handshake.types.server_key_exchange

  constructor(
    readonly params: ServerDHParams
  ) { }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const params = ServerDHParams.read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(params)
  }
}

export class ServerKeyExchange2Ephemeral {
  readonly class = ServerKeyExchange2Ephemeral

  static type = Handshake.types.server_key_exchange

  constructor(
    readonly params: ServerDHParams,
    readonly signed_params: DigitallySigned
  ) { }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const params = ServerDHParams.read(binary)
    const signed_params = DigitallySigned.read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(params, signed_params)
  }
}

export class ServerKeyExchange2 {
  readonly class = ServerKeyExchange2

  static type = Handshake.types.server_key_exchange

  constructor() { }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    /**
     * Nothing to read
     */

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this()
  }
}