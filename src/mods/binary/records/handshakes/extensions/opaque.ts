import { Cursor, Opaque, UnsafeOpaque } from "@hazae41/binary"
import { Number16 } from "mods/binary/numbers/number16.js"
import { ReadableVector } from "mods/binary/vectors/readable.js"
import { Extension } from "./extension.js"

export class OpaqueExtension {

  static read(cursor: Cursor) {
    const extension_type = cursor.readUint16()
    const extension_data = ReadableVector(Number16, UnsafeOpaque).read(cursor)

    return new Extension<Opaque>(extension_type, extension_data)
  }

}