import { Cursor, Opaque, UnsafeOpaque } from "@hazae41/binary"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js"
import { ReadableVector } from "mods/binary/vectors/readable.js"
import { ECPointFormats } from "./ec_point_formats/ec_point_formats.js"
import { EllipticCurves } from "./elliptic_curves/elliptic_curves.js"
import { SignatureAlgorithms } from "./signature_algorithms/signature_algorithms.js"

export type Extensions =
  | SignatureAlgorithms
  | EllipticCurves
  | ECPointFormats
  | Opaque

export class TypedExtension {

  private static read2(type: number, cursor: Cursor) {
    if (type === Extension.types.signature_algorithms)
      return ReadableVector(Number16, SignatureAlgorithms).read(cursor)
    if (type === Extension.types.elliptic_curves)
      return ReadableVector(Number16, EllipticCurves).read(cursor)
    if (type === Extension.types.ec_point_formats)
      return ReadableVector(Number16, ECPointFormats).read(cursor)

    return ReadableVector(Number16, UnsafeOpaque).read(cursor)
  }

  static read(cursor: Cursor) {
    const subtype = cursor.readUint16()
    const data = this.read2(subtype, cursor)

    return new Extension<Extensions>(subtype, data)
  }
}