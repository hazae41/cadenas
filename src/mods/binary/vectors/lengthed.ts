import { Binary } from "@hazae41/binary";
import { Lengthed, LengthedClass } from "mods/binary/fragment.js";
import { NumberClass, NumberX } from "mods/binary/number.js";

export const LengthedVector = <L extends NumberX, T extends Lengthed<T>>(vlength: NumberClass<L>, clazz: LengthedClass<T>) => class {
  readonly #class = LengthedVector(vlength, clazz)

  constructor(
    readonly value: T
  ) { }

  static from(value: T) {
    return new this(value)
  }

  get vlength() {
    return vlength
  }

  get class() {
    return this.#class
  }

  size() {
    return vlength.size + this.value.size()
  }

  write(binary: Binary) {
    new vlength(this.value.size()).write(binary)

    this.value.write(binary)
  }

  static read(binary: Binary) {
    const length = vlength.read(binary).value
    const start = binary.offset

    const value = clazz.read(binary, length)

    if (binary.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new this(value)
  }
}