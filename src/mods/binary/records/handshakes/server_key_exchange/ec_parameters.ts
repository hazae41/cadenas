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

  write(binary: Binary) {
    this.curve_type.write(binary)
    this.named_curve.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    const curve_type = ECCurveType.read(binary)
    const named_curve = NamedCurve.read(binary)

    return new this(curve_type, named_curve)
  }
}