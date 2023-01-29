import { Binary } from "@hazae41/binary";
import { Array } from "mods/binary/arrays/array.js";
import { UnlengthedArray } from "mods/binary/arrays/unlengthed.js";
import { WritableArray } from "mods/binary/arrays/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { NamedCurve } from "mods/binary/records/handshakes/extensions/elliptic_curves/named_curve.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/vector.js";
import { WritableVector } from "mods/binary/vectors/writable.js";

export class NamedCurveList {
  readonly #class = NamedCurveList

  constructor(
    readonly named_curve_list: Vector<Number16, Array<NamedCurve>>
  ) { }

  static default() {
    const { secp256r1, secp384r1, secp521r1, x25519 } = NamedCurve.instances

    return this.from([secp256r1, secp384r1, secp521r1, x25519])
  }

  static from(named_curves: NamedCurve[]) {
    const named_curve_list = WritableVector(Number16).from(WritableArray.from(named_curves))

    return new this(named_curve_list)
  }

  get class() {
    return this.#class
  }

  size() {
    return this.named_curve_list.size()
  }

  write(binary: Binary) {
    this.named_curve_list.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    const named_curve_list = LengthedVector(Number16, UnlengthedArray(NamedCurve)).read(binary)

    return new this(named_curve_list)
  }
}