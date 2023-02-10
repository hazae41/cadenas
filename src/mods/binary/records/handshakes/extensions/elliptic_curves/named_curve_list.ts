import { Binary } from "@hazae41/binary";
import { UnlengthedList } from "mods/binary/lists/unlengthed.js";
import { List } from "mods/binary/lists/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { NamedCurve } from "mods/binary/records/handshakes/extensions/elliptic_curves/named_curve.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class NamedCurveList {

  constructor(
    readonly named_curve_list: Vector<Number16, List<NamedCurve>>
  ) { }

  static default() {
    const { secp256r1, secp384r1, secp521r1, x25519, x448 } = NamedCurve.instances

    return this.from([secp256r1]) // TODO
  }

  static from(named_curves: NamedCurve[]) {
    const named_curve_list = Vector(Number16).from(List.from(named_curves))

    return new this(named_curve_list)
  }

  size() {
    return this.named_curve_list.size()
  }

  write(cursor: Binary) {
    this.named_curve_list.write(cursor)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary) {
    const named_curve_list = LengthedVector(Number16, UnlengthedList(NamedCurve)).read(cursor)

    return new this(named_curve_list)
  }
}