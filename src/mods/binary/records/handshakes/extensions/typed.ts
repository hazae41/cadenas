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

  private static read2(type: number, binary: Binary) {
    if (type === Extension.types.signature_algorithms)
      return LengthedVector(Number16, SignatureAlgorithms).read(binary)
    if (type === Extension.types.elliptic_curves)
      return LengthedVector(Number16, EllipticCurves).read(binary)
    if (type === Extension.types.ec_point_formats)
      return LengthedVector(Number16, ECPointFormats).read(binary)

    return LengthedVector(Number16, Opaque).read(binary)
  }

  static read(binary: Binary) {
    const subtype = binary.readUint16()
    const data = this.read2(subtype, binary)

    return new Extension<Extensions>(subtype, data)
  }
}