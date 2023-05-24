import { BinaryReadError, Opaque, UnsafeOpaque } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { Number16 } from "mods/binary/numbers/number16.js"
import { ReadableVector } from "mods/binary/vectors/readable.js"
import { Extension } from "./extension.js"

export class OpaqueExtension {

  static tryRead(cursor: Cursor): Result<Extension<Opaque>, BinaryReadError> {
    return Result.unthrowSync(t => {
      const extension_type = cursor.tryReadUint16().throw(t)
      const extension_data = ReadableVector(Number16, UnsafeOpaque).tryRead(cursor).throw(t)

      return new Ok(new Extension<Opaque>(extension_type, extension_data))
    })
  }

}