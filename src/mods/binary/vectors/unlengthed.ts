import { Binary } from "@hazae41/binary";
import { Unlengthed, UnlengthedClass } from "mods/binary/fragment.js";
import { NumberClass, NumberX } from "mods/binary/number.js";

export const UnlengthedVector = <L extends NumberX, T extends Unlengthed<T>>(vlength: NumberClass<L>, clazz: UnlengthedClass<T>) => class {
  readonly #class = UnlengthedVector(vlength, clazz)

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

    const value = clazz.read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new this(value)
  }
}