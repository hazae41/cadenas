import { Binary } from "@hazae41/binary";
import { NamedCurve } from "mods/binary/records/handshakes/extensions/elliptic_curves/named_curve.js";
import { ECCurveType } from "./ec_curve_type.js";

export class ECParameters {

  constructor(
    readonly curve_type: ECCurveType,
    readonly named_curve: NamedCurve
  ) { }

  size() {
    return this.curve_type.size() + this.named_curve.size()
  }

  write(cursor: Binary) {
    this.curve_type.write(cursor)
    this.named_curve.write(cursor)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary) {
    const curve_type = ECCurveType.read(cursor)
    const named_curve = NamedCurve.read(cursor)

    return new this(curve_type, named_curve)
  }
}