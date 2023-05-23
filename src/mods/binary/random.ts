import { Bytes } from "@hazae41/bytes"
import { Cursor, CursorReadLengthOverflowError, CursorReadUnknownError, CursorWriteLengthOverflowError, CursorWriteUnknownError } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"

export class Random {

  constructor(
    readonly gmt_unix_time: number,
    readonly random_bytes: Bytes<28>
  ) { }

  static default() {
    const gmt_unix_time = ~~(Date.now() / 1000)
    const random_bytes = Bytes.random(28)

    return new this(gmt_unix_time, random_bytes)
  }

  trySize(): Result<number, never> {
    return new Ok(4 + this.random_bytes.length)
  }

  tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError | CursorWriteLengthOverflowError> {
    return Result.unthrowSync(t => {
      cursor.tryWriteUint32(this.gmt_unix_time).throw(t)
      cursor.tryWrite(this.random_bytes).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<Random, CursorReadUnknownError | CursorReadLengthOverflowError> {
    return Result.unthrowSync(t => {
      const gmt_unix_time = cursor.tryReadUint32().throw(t)
      const random_bytes = Bytes.from(cursor.tryRead(28).throw(t))

      return new Ok(new Random(gmt_unix_time, random_bytes))
    })
  }
}