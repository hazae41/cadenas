import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/number.js";
import { ArrayVector } from "mods/binary/vector.js";
import { NamedCurve } from "./named_curve.js";

export class NamedCurveList {
  readonly #class = NamedCurveList

  constructor(
    readonly named_curve_list: ArrayVector<Number16, NamedCurve>
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return this.named_curve_list.size()
  }

  write(binary: Binary) {
    this.named_curve_list.write(binary)
  }

  static read(binary: Binary) {
    const named_curve_list = ArrayVector(Number16, NamedCurve).read(binary)

    return new this(named_curve_list)
  }
}