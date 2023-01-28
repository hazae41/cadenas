import { Binary } from "@hazae41/binary"
import { Unlengthed, UnlengthedClass } from "mods/binary/fragment.js"
import { Writable } from "mods/binary/writable.js"

export interface Array<T extends Writable> extends Writable {
  readonly array: T[]
}

export const WritableArray = <T extends Writable>() => class {
  readonly #class = WritableArray

  constructor(
    readonly array: T[]
  ) { }

  static from(array: T[]) {
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

export const UnlengthedArray = <T extends Unlengthed<T>>(clazz: UnlengthedClass<T>) => class {
  readonly #class = UnlengthedArray(clazz)

  constructor(
    readonly array: T[]
  ) { }

  static from(array: T[]) {
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

  static read(binary: Binary, length: number) {
    const start = binary.offset
    const array = new Array<T>()

    while (binary.offset - start < length)
      array.push(clazz.read(binary))

    if (binary.offset - start !== length)
      throw new Error(`Invalid array length`)

    return new this(array)
  }
}