import { BinaryReadError, BinaryWriteError, Opaque, SafeOpaque } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Number16 } from "mods/binary/numbers/number16.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class ServerDHParams {

  constructor(
    readonly dh_p: Vector<Number16, Opaque>,
    readonly dh_g: Vector<Number16, Opaque>,
    readonly dh_Ys: Vector<Number16, Opaque>
  ) { }

  trySize(): Result<number, never> {
    return new Ok(0
      + this.dh_p.trySize().get()
      + this.dh_g.trySize().get()
      + this.dh_Ys.trySize().get())
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      this.dh_p.tryWrite(cursor).throw(t)
      this.dh_g.tryWrite(cursor).throw(t)
      this.dh_Ys.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<ServerDHParams, BinaryReadError> {
    return Result.unthrowSync(t => {
      const dh_p = ReadableVector(Number16, SafeOpaque).tryRead(cursor).throw(t)
      const dh_g = ReadableVector(Number16, SafeOpaque).tryRead(cursor).throw(t)
      const dh_Ys = ReadableVector(Number16, SafeOpaque).tryRead(cursor).throw(t)

      return new Ok(new ServerDHParams(dh_p, dh_g, dh_Ys))
    })
  }

}