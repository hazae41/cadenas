import { Binary } from "@hazae41/binary";
import { NumberClass, NumberX } from "mods/binary/number.js";
import { Writable } from "mods/binary/writable.js";

export const WritableVector = <L extends NumberX>(vlength: NumberClass<L>) => class <T extends Writable> {
  readonly #class = WritableVector(vlength)

  constructor(
    readonly value: T
  ) { }

  static from<T extends Writable>(value: T) {
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
}