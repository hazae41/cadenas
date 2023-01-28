import { Binary } from "@hazae41/binary"
import { Number16 } from "mods/binary/number.js"
import { Opaque } from "mods/binary/opaque.js"
import { LengthedVector } from "mods/binary/vectors/lengthed.js"
import { Vector } from "mods/binary/vectors/vector.js"

export class ServerDHParams {
  readonly #class = ServerDHParams

  constructor(
    readonly dh_p: Vector<Number16, Opaque>,
    readonly dh_g: Vector<Number16, Opaque>,
    readonly dh_Ys: Vector<Number16, Opaque>
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return 0
      + this.dh_p.size()
      + this.dh_g.size()
      + this.dh_Ys.size()
  }

  write(binary: Binary) {
    this.dh_p.write(binary)
    this.dh_g.write(binary)
    this.dh_Ys.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    const dh_p = LengthedVector(Number16, Opaque).read(binary)
    const dh_g = LengthedVector(Number16, Opaque).read(binary)
    const dh_Ys = LengthedVector(Number16, Opaque).read(binary)

    return new this(dh_p, dh_g, dh_Ys)
  }
}