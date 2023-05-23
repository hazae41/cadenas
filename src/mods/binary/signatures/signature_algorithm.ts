import { Cursor, CursorReadUnknownError, CursorWriteUnknownError } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"

export class SignatureAlgorithm {

  static readonly types = {
    anonymous: 0,
    rsa: 1,
    dsa: 2,
    ecdsa: 3
  } as const

  static readonly instances = {
    anonymous: new SignatureAlgorithm(SignatureAlgorithm.types.anonymous),
    rsa: new SignatureAlgorithm(SignatureAlgorithm.types.rsa),
    dsa: new SignatureAlgorithm(SignatureAlgorithm.types.dsa),
    ecdsa: new SignatureAlgorithm(SignatureAlgorithm.types.ecdsa)
  } as const

  constructor(
    readonly type: number
  ) { }

  static new(type: number) {
    return new SignatureAlgorithm(type)
  }

  trySize(): Result<number, never> {
    return new Ok(1)
  }

  tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError> {
    return cursor.tryWriteUint8(this.type)
  }

  static tryRead(cursor: Cursor): Result<SignatureAlgorithm, CursorReadUnknownError> {
    return cursor.tryReadUint8().mapSync(SignatureAlgorithm.new)
  }

}