import { BinaryReadError, Opaque, UnsafeOpaque } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { Vector } from "index.js"
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

  static #tryRead2(type: number, cursor: Cursor): Result<Vector<Number16, Extensions>, BinaryReadError> {
    if (type === Extension.types.signature_algorithms)
      return ReadableVector(Number16, SignatureAlgorithms).tryRead(cursor)
    if (type === Extension.types.elliptic_curves)
      return ReadableVector(Number16, EllipticCurves).tryRead(cursor)
    if (type === Extension.types.ec_point_formats)
      return ReadableVector(Number16, ECPointFormats).tryRead(cursor)

    return ReadableVector(Number16, UnsafeOpaque).tryRead(cursor)
  }

  static tryRead(cursor: Cursor): Result<Extension<Extensions>, BinaryReadError> {
    return Result.unthrowSync(t => {
      const type = cursor.tryReadUint16().throw(t)
      const data = this.#tryRead2(type, cursor).throw(t)

      return new Ok(new Extension<Extensions>(type, data))
    })
  }

}