import { Binary } from "@hazae41/binary"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Opaque } from "mods/binary/opaque.js"
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js"
import { LengthedVector } from "mods/binary/vectors/lengthed.js"
import { ECPointFormats } from "./ec_point_formats/ec_point_formats.js"
import { EllipticCurves } from "./elliptic_curves/elliptic_curves.js"
import { SignatureAlgorithms } from "./signature_algorithms/signature_algorithms.js"

export type Extensions =
  | SignatureAlgorithms
  | EllipticCurves
  | ECPointFormats
  | Opaque

export class TypedExtension {

  private static read2(type: number, cursor: Binary) {
    if (type === Extension.types.signature_algorithms)
      return LengthedVector(Number16, SignatureAlgorithms).read(cursor)
    if (type === Extension.types.elliptic_curves)
      return LengthedVector(Number16, EllipticCurves).read(cursor)
    if (type === Extension.types.ec_point_formats)
      return LengthedVector(Number16, ECPointFormats).read(cursor)

    return LengthedVector(Number16, Opaque).read(cursor)
  }

  static read(cursor: Binary) {
    const subtype = cursor.readUint16()
    const data = this.read2(subtype, cursor)

    return new Extension<Extensions>(subtype, data)
  }
}