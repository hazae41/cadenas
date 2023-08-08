import { BinaryReadError, BinaryWriteError } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"

export class NameType {

  static readonly types = {
    host_name: 0,
  } as const

  static readonly instances = {
    host_name: new NameType(NameType.types.host_name),
  } as const

  constructor(
    readonly type: number
  ) { }

  static new(type: number) {
    return new NameType(type)
  }

  trySize(): Result<number, never> {
    return new Ok(1)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return cursor.tryWriteUint8(this.type)
  }

  static tryRead(cursor: Cursor): Result<NameType, BinaryReadError> {
    return cursor.tryReadUint8().mapSync(NameType.new)
  }

}