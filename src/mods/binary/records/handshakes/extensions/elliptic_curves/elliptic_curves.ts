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

  extension() {
    return Extension.from(this.#class.type, this)
  }

  static read(binary: Binary) {
    const named_curve_list = NamedCurveList.read(binary)

    return new this(named_curve_list)
  }
}