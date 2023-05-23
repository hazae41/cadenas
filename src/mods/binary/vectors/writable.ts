import { Writable } from "@hazae41/binary";
import { Cursor, CursorWriteUnknownError } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { NumberClass, NumberX } from "mods/binary/numbers/number.js";

export interface Vector<L extends NumberX, T extends Writable.Infer<T>> extends Writable<Writable.SizeError<T>, Writable.SizeError<T> | Writable.WriteError<T> | CursorWriteUnknownError> {
  readonly vlength: NumberClass<L>
  readonly value: T
}

export const Vector = <L extends NumberX>(vlength: NumberClass<L>) => class <T extends Writable.Infer<T>> {

  constructor(
    readonly value: T
  ) { }

  static from<T extends Writable.Infer<T>>(value: T) {
    return new this(value)
  }

  get vlength() {
    return vlength
  }

  trySize(): Result<number, Writable.SizeError<T>> {
    return Result.unthrowSync(t => {
      const size = this.value.trySize().throw(t)
      return new Ok(vlength.size + size)
    })
  }

  tryWrite(cursor: Cursor): Result<void, Writable.SizeError<T> | Writable.WriteError<T> | CursorWriteUnknownError> {
    return Result.unthrowSync(t => {
      const size = this.value.trySize().throw(t)
      new vlength(size).tryWrite(cursor).throw(t)

      this.value.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

}