import { Opaque, SafeOpaque } from "@hazae41/binary";
import { Cursor, CursorWriteLengthOverflowError, CursorWriteUnknownError } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Number16 } from "mods/binary/numbers/number16.js";
import { SignatureAndHashAlgorithm } from "mods/binary/signatures/signature_and_hash_algorithm.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class DigitallySigned {

  constructor(
    readonly algorithm: SignatureAndHashAlgorithm,
    readonly signature: Vector<Number16, Opaque>
  ) { }

  trySize(): Result<number, never> {
    const algorithm = this.algorithm.trySize().get()
    const signature = this.signature.trySize().get()

    return new Ok(algorithm + signature)
  }

  tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError | CursorWriteLengthOverflowError> {
    return Result.unthrowSync(t => {
      this.algorithm.tryWrite(cursor).throw(t)
      this.signature.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static read(cursor: Cursor) {
    return Result.unthrowSync(t => {
      const algorithm = SignatureAndHashAlgorithm.tryRead(cursor).throw(t)
      const signature = ReadableVector(Number16, SafeOpaque).tryRead(cursor).throw(t)

      return new Ok(new DigitallySigned(algorithm, signature))
    })
  }
}