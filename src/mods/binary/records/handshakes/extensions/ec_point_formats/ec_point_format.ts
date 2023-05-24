import { BinaryReadError, BinaryWriteError } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"

export class ECPointFormat {

  static readonly types = {
    uncompressed: 0,
    // deprecated: 1..2,
    // reserved: 248..255
  } as const

  static readonly instances = {
    uncompressed: new this(this.types.uncompressed)
  } as const

  constructor(
    readonly value: number
  ) { }

  static new(value: number) {
    return new ECPointFormat(value)
  }

  trySize(): Result<number, never> {
    return new Ok(1)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return cursor.tryWriteUint8(this.value)
  }

  static tryRead(cursor: Cursor): Result<ECPointFormat, BinaryReadError> {
    return cursor.tryReadUint8().mapSync(ECPointFormat.new)
  }

}
