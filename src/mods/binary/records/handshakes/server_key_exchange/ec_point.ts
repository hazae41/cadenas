import { BinaryReadError, BinaryWriteError, Opaque, SafeOpaque } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { Number8 } from "mods/binary/numbers/number8.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class ECPoint {

  constructor(
    readonly point: Vector<Number8, Opaque>
  ) { }

  static new(point: Vector<Number8, Opaque>) {
    return new ECPoint(point)
  }

  static from(bytes: Uint8Array) {
    const point = Vector(Number8).from(new Opaque(bytes))

    return new this(point)
  }

  trySize(): Result<number, never> {
    return this.point.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.point.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<ECPoint, BinaryReadError> {
    return ReadableVector(Number8, SafeOpaque).tryRead(cursor).mapSync(ECPoint.new)
  }

}