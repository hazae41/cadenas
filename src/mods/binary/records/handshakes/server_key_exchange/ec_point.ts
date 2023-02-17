import { Cursor, Opaque, SafeOpaque } from "@hazae41/binary";
import { Number8 } from "mods/binary/numbers/number8.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
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

  write(cursor: Cursor) {
    this.point.write(cursor)
  }

  static read(cursor: Cursor) {
    const point = ReadableVector(Number8, SafeOpaque).read(cursor)

    return new this(point)
  }
}