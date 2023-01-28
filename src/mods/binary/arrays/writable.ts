import { Binary } from "@hazae41/binary"
import { Writable } from "mods/binary/writable.js"

export const WritableArray = () => class <T extends Writable> {
  readonly #class = WritableArray

  constructor(
    readonly array: T[]
  ) { }

  static from<T extends Writable>(array: T[]) {
    return new this(array)
  }

  get class() {
    return this.#class
  }

  size() {
    let size = 0

    for (const element of this.array)
      size += element.size()

    return size
  }

  write(binary: Binary) {
    for (const element of this.array)
      element.write(binary)
  }
}