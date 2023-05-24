import { BinaryReadError, BinaryWriteError } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"

export class ECCurveType {

  static readonly types = {
    // deprecated: 1..2,
    named_curve: 3,
    // reserved: 248..255
  } as const

  static readonly instances = {
    named_curve: new this(this.types.named_curve)
  } as const

  constructor(
    readonly value: number
  ) { }

  static new(value: number) {
    return new ECCurveType(value)
  }

  trySize(): Result<number, never> {
    return new Ok(1)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return cursor.tryWriteUint8(this.value)
  }

  static tryRead(cursor: Cursor): Result<ECCurveType, BinaryReadError> {
    return cursor.tryReadUint8().mapSync(ECCurveType.new)
  }

}