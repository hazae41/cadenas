import { Binary } from "@hazae41/binary"
import { Number16 } from "mods/binary/number.js"
import { BytesVector } from "mods/binary/vector.js"

export class ServerDHParams {
  readonly #class = ServerDHParams

  constructor(
    readonly dh_p: BytesVector<Number16>,
    readonly dh_g: BytesVector<Number16>,
    readonly dh_Ys: BytesVector<Number16>
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

  static read(binary: Binary) {
    const dh_p = BytesVector(Number16).read(binary)
    const dh_g = BytesVector(Number16).read(binary)
    const dh_Ys = BytesVector(Number16).read(binary)

    return new this(dh_p, dh_g, dh_Ys)
  }
}