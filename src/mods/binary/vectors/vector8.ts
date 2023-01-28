import { Binary } from "@hazae41/binary";
import { NumberClass, NumberX } from "mods/binary/number.js";

export const Vector8 = <L extends NumberX>(vlength: NumberClass<L>) => class {
  readonly #class = Vector8(vlength)

  constructor(
    readonly array: number[]
  ) { }

  static from(array: number[]) {
    return new this(array)
  }

  get vlength() {
    return vlength
  }

  get class() {
    return this.#class
  }

  size() {
    return vlength.size + this.array.length
  }

  write(binary: Binary) {
    new vlength(this.array.length).write(binary)

    for (const element of this.array)
      binary.writeUint8(element)
  }

  static read(binary: Binary) {
    const length = vlength.read(binary).value

    const start = binary.offset
    const array = new Array<number>()

    while (binary.offset - start < length)
      array.push(binary.readUint8())

    if (binary.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new this(array)
  }
}