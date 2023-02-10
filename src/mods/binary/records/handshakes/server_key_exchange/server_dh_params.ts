import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Opaque, SafeOpaque } from "mods/binary/opaque.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class ServerDHParams {

  constructor(
    readonly dh_p: Vector<Number16, Opaque>,
    readonly dh_g: Vector<Number16, Opaque>,
    readonly dh_Ys: Vector<Number16, Opaque>
  ) { }

  size() {
    return 0
      + this.dh_p.size()
      + this.dh_g.size()
      + this.dh_Ys.size()
  }

  write(cursor: Binary) {
    this.dh_p.write(cursor)
    this.dh_g.write(cursor)
    this.dh_Ys.write(cursor)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary) {
    const dh_p = LengthedVector(Number16, SafeOpaque).read(cursor)
    const dh_g = LengthedVector(Number16, SafeOpaque).read(cursor)
    const dh_Ys = LengthedVector(Number16, SafeOpaque).read(cursor)

    return new this(dh_p, dh_g, dh_Ys)
  }
}