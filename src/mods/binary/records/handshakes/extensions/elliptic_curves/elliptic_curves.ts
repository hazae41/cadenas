import { Binary } from "@hazae41/binary";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";
import { NamedCurveList } from "./named_curve_list.js";

export class EllipticCurves {
  readonly #class = EllipticCurves

  static readonly type = Extension.types.elliptic_curves

  constructor(
    readonly named_curve_list: NamedCurveList
  ) { }

  size() {
    return this.named_curve_list.size()
  }

  write(binary: Binary) {
    this.named_curve_list.write(binary)
  }

  static read(binary: Binary) {

  }
}