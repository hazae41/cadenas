import { Cursor, CursorReadUnknownError, CursorWriteUnknownError } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"

export class Number8 {
  readonly #class = Number8

  static readonly size = 1 as const

  constructor(
    readonly value: number
  ) { }

  static new(value: number) {
    return new Number8(value)
  }

  trySize(): Result<number, never> {
    return new Ok(this.#class.size)
  }

  tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError> {
    return cursor.tryWriteUint8(this.value)
  }

  static tryRead(cursor: Cursor): Result<Number8, CursorReadUnknownError> {
    return cursor.tryReadUint8().mapSync(Number8.new)
  }

}