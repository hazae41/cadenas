import { BinaryWriteError, Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Vector } from "mods/binary/vectors/writable.js";

export interface Extensionable<T extends Writable> extends Writable.Infer<T> {
  readonly type: number
}

export class Extension<T extends Writable.Infer<T>> {

  static readonly types = {
    elliptic_curves: 10,
    ec_point_formats: 11,
    signature_algorithms: 13
  } as const

  constructor(
    readonly subtype: number,
    readonly data: Vector<Number16, T>
  ) { }

  static from<T extends Extensionable<T>>(extension: T) {
    const extension_data = Vector(Number16).from(extension)

    return new Extension(extension.type, extension_data)
  }

  trySize(): Result<number, Writable.SizeError<T>> {
    return this.data.trySize().mapSync(x => 2 + x)
  }

  tryWrite(cursor: Cursor): Result<void, Writable.SizeError<T> | Writable.WriteError<T> | BinaryWriteError> {
    return Result.unthrowSync(t => {
      cursor.tryWriteUint16(this.subtype).throw(t)
      this.data.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

}