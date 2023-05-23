import { Cursor, CursorReadUnknownError, CursorWriteUnknownError } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { HashAlgorithm } from "mods/binary/signatures/hash_algorithm.js";
import { SignatureAlgorithm } from "mods/binary/signatures/signature_algorithm.js";

export class SignatureAndHashAlgorithm {

  static readonly instances = {
    rsaWithSha256: new this(HashAlgorithm.instances.sha256, SignatureAlgorithm.instances.rsa)
  } as const

  constructor(
    readonly hash: HashAlgorithm,
    readonly signature: SignatureAlgorithm
  ) { }

  trySize(): Result<number, never> {
    const hash = this.hash.trySize().get()
    const signature = this.signature.trySize().get()

    return new Ok(hash + signature)
  }

  tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError> {
    return Result.unthrowSync(t => {
      this.hash.tryWrite(cursor).throw(t)
      this.signature.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<SignatureAndHashAlgorithm, CursorReadUnknownError> {
    return Result.unthrowSync(t => {
      const hash = HashAlgorithm.tryRead(cursor).throw(t)
      const signature = SignatureAlgorithm.tryRead(cursor).throw(t)

      return new Ok(new SignatureAndHashAlgorithm(hash, signature))
    })
  }

}