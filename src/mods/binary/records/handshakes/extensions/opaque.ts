import { Binary } from "@hazae41/binary"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Opaque } from "mods/binary/opaque.js"
import { LengthedVector } from "mods/binary/vectors/lengthed.js"
import { Extension } from "./extension.js"

export class OpaqueExtension {

  static read(binary: Binary) {
    const extension_type = binary.readUint16()
    const extension_data = LengthedVector(Number16, Opaque).read(binary)

    return new Extension(extension_type, extension_data)
  }

}