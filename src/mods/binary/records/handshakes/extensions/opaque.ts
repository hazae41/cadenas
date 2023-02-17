import { Cursor } from "@hazae41/binary"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Opaque } from "mods/binary/opaque.js"
import { LengthedVector } from "mods/binary/vectors/lengthed.js"
import { Extension } from "./extension.js"

export class OpaqueExtension {

  static read(cursor: Cursor) {
    const extension_type = cursor.readUint16()
    const extension_data = LengthedVector(Number16, Opaque).read(cursor)

    return new Extension(extension_type, extension_data)
  }

}