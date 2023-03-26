import { Cursor } from "@hazae41/binary";
import { ReadableList } from "mods/binary/lists/readable.js";
import { List } from "mods/binary/lists/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { NamedCurve } from "mods/binary/records/handshakes/extensions/elliptic_curves/named_curve.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
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

  write(cursor: Cursor) {
    this.named_curve_list.write(cursor)
  }

  static read(cursor: Cursor) {
    const named_curve_list = ReadableVector(Number16, ReadableList(NamedCurve)).read(cursor)

    return new this(named_curve_list)
  }
}