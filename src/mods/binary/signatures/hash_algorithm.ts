import { Cursor, CursorReadUnknownError, CursorWriteUnknownError } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";

export class HashAlgorithm {

  static readonly types = {
    none: 0,
    md5: 1,
    sha1: 2,
    sha224: 3,
    sha256: 4,
    sha384: 5,
    sha512: 6,
  } as const

  static readonly instances = {
    none: new HashAlgorithm(HashAlgorithm.types.none),
    md5: new HashAlgorithm(HashAlgorithm.types.md5),
    sha1: new HashAlgorithm(HashAlgorithm.types.sha1),
    sha224: new HashAlgorithm(HashAlgorithm.types.sha224),
    sha256: new HashAlgorithm(HashAlgorithm.types.sha256),
    sha384: new HashAlgorithm(HashAlgorithm.types.sha384),
    sha512: new HashAlgorithm(HashAlgorithm.types.sha512)
  } as const

  constructor(
    readonly type: number
  ) { }

  static new(type: number) {
    return new HashAlgorithm(type)
  }

  trySize(): Result<number, never> {
    return new Ok(1)
  }

  tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError> {
    return cursor.tryWriteUint8(this.type)
  }

  static tryRead(cursor: Cursor): Result<HashAlgorithm, CursorReadUnknownError> {
    return cursor.tryReadUint8().mapSync(HashAlgorithm.new)
  }

}