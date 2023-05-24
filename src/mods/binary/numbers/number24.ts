import { BinaryReadError, BinaryWriteError } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"

export class Number24 {
  readonly #class = Number24

  static readonly size = 3 as const

  constructor(
    readonly value: number
  ) { }

  static new(value: number) {
    return new Number24(value)
  }

  trySize(): Result<number, never> {
    return new Ok(this.#class.size)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return cursor.tryWriteUint24(this.value)
  }

  static tryRead(cursor: Cursor): Result<Number24, BinaryReadError> {
    return cursor.tryReadUint24().mapSync(Number24.new)
  }

}