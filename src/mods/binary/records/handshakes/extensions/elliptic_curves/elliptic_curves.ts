import { Binary } from "@hazae41/binary";
import { NamedCurveList } from "mods/binary/records/handshakes/extensions/elliptic_curves/named_curve_list.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";

export class EllipticCurves {
  readonly #class = EllipticCurves

  static readonly type = Extension.types.elliptic_curves

  constructor(
    readonly named_curve_list: NamedCurveList
  ) { }

  static default() {
    return new this(NamedCurveList.default())
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

  extension() {
    return Extension.from(this.#class.type, this)
  }

  static read(cursor: Binary) {
    const named_curve_list = NamedCurveList.read(cursor)

    return new this(named_curve_list)
  }
}