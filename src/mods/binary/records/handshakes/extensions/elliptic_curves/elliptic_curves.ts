import { Cursor } from "@hazae41/binary";
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

  write(cursor: Cursor) {
    this.named_curve_list.write(cursor)
  }

  extension() {
    return Extension.from(this.#class.type, this)
  }

  static read(cursor: Cursor) {
    const named_curve_list = NamedCurveList.read(cursor)

    return new this(named_curve_list)
  }
}