import { Cursor, Opaque, SafeOpaque } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
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

  write(cursor: Cursor) {
    this.dh_p.write(cursor)
    this.dh_g.write(cursor)
    this.dh_Ys.write(cursor)
  }

  static read(cursor: Cursor) {
    const dh_p = ReadableVector(Number16, SafeOpaque).read(cursor)
    const dh_g = ReadableVector(Number16, SafeOpaque).read(cursor)
    const dh_Ys = ReadableVector(Number16, SafeOpaque).read(cursor)

    return new this(dh_p, dh_g, dh_Ys)
  }
}