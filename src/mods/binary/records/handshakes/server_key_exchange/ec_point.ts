import { Binary } from "@hazae41/binary";
import { Number8 } from "mods/binary/numbers/number8.js";
import { Opaque } from "mods/binary/opaque.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class ECPoint {

  constructor(
    readonly point: Vector<Number8, Opaque>
  ) { }

  static from(bytes: Uint8Array) {
    const point = Vector(Number8).from(new Opaque(bytes))

    return new this(point)
  }

  size() {
    return this.point.size()
  }

  write(cursor: Binary) {
    this.point.write(cursor)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary) {
    const point = LengthedVector(Number8, Opaque).read(cursor)

    return new this(point)
  }
}