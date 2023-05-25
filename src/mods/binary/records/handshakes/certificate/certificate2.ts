import { BinaryReadError, BinaryWriteError, Opaque, SafeOpaque } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { ReadableList } from "mods/binary/lists/readable.js"
import { List } from "mods/binary/lists/writable.js"
import { Number24 } from "mods/binary/numbers/number24.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ReadableVector } from "mods/binary/vectors/readable.js"
import { Vector } from "mods/binary/vectors/writable.js"

export class Certificate2 {
  readonly #class = Certificate2

  static readonly handshake_type = Handshake.types.certificate

  constructor(
    readonly certificate_list: Vector<Number24, List<Vector<Number24, Opaque>>>
  ) { }

  get handshake_type() {
    return this.#class.handshake_type
  }

  trySize(): Result<number, never> {
    return this.certificate_list.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.certificate_list.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<Certificate2, BinaryReadError> {
    return Result.unthrowSync(t => {
      const opaque_vector24 = ReadableVector(Number24, SafeOpaque)
      const opaque_vector24_list = ReadableList(opaque_vector24)
      const opaque_vector_list_vector24 = ReadableVector(Number24, opaque_vector24_list)
      const certificate_list = opaque_vector_list_vector24.tryRead(cursor).throw(t)

      return new Ok(new Certificate2(certificate_list))
    })
  }

}