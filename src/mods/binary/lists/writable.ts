import { Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";

export interface List<T extends Writable.Infer<T>> extends Writable.Infer<T> {
  readonly array: T[]
}

export class List<T extends Writable.Infer<T>> {

  constructor(
    readonly array: T[]
  ) { }

  static from<T extends Writable.Infer<T>>(array: T[]) {
    return new this(array)
  }

  trySize(): Result<number, Writable.SizeError<T>> {
    return Result.unthrowSync(t => {
      let size = 0

      for (const element of this.array)
        size += element.trySize().throw(t)

      return new Ok(size)
    })
  }

  tryWrite(cursor: Cursor): Result<void, Writable.WriteError<T>> {
    return Result.unthrowSync(t => {
      for (const element of this.array)
        element.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

}