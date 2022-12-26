import { Binary } from "@hazae41/binary"
import { Number16 } from "mods/binary/number.js"
import { BufferVector } from "mods/binary/vector.js"

export class ServerDHParams {
  readonly #class = ServerDHParams

  constructor(
    readonly dh_p: BufferVector<Number16>,
    readonly dh_g: BufferVector<Number16>,
    readonly dh_Ys: BufferVector<Number16>
  ) { }

  get class() {
    return this.#class
  }

  static read(binary: Binary) {
    const dh_p = BufferVector<Number16>(Number16).read(binary)
    const dh_g = BufferVector<Number16>(Number16).read(binary)
    const dh_Ys = BufferVector<Number16>(Number16).read(binary)

    return new this(dh_p, dh_g, dh_Ys)
  }
}