import { Binary } from "@hazae41/binary";
import { UnlengthedArray } from "mods/binary/array.js";
import { Number16 } from "mods/binary/number.js";
import { LengthedVector } from "mods/binary/vector.js";
import { NamedCurve } from "./named_curve.js";

export class NamedCurveList {
  readonly #class = NamedCurveList

  constructor(
    readonly named_curve_list: LengthedVector<Number16, UnlengthedArray<NamedCurve>>
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
    const named_curve_list = LengthedVector(Number16, UnlengthedArray(NamedCurve)).read(binary)

    return new this(named_curve_list)
  }
}