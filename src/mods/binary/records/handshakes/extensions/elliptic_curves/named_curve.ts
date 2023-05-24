import { BinaryReadError, BinaryWriteError } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"

export class NamedCurve {

  static readonly types = {
    secp256r1: 23,
    secp384r1: 24,
    secp521r1: 25,
    x25519: 29,
    x448: 30,
  } as const

  static readonly instances = {
    secp256r1: new this(this.types.secp256r1),
    secp384r1: new this(this.types.secp384r1),
    secp521r1: new this(this.types.secp521r1),
    x25519: new this(this.types.x25519),
    x448: new this(this.types.x448),
  }

  constructor(
    readonly value: number
  ) { }

  static new(value: number) {
    return new NamedCurve(value)
  }

  trySize(): Result<number, never> {
    return new Ok(2)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return cursor.tryWriteUint16(this.value)
  }

  static tryRead(cursor: Cursor): Result<NamedCurve, BinaryReadError> {
    return cursor.tryReadUint16().mapSync(NamedCurve.new)
  }

}
