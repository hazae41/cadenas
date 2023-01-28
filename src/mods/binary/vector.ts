import { Binary } from "@hazae41/binary";
import { Lengthed, LengthedClass, Unlengthed, UnlengthedClass } from "mods/binary/fragment.js";
import { NumberClass, NumberX } from "mods/binary/number.js";
import { Writable } from "mods/binary/writable.js";

export interface Vector<L extends NumberX, T extends Writable> extends Writable {
  readonly vlength: NumberClass<L>
  readonly value: T
}

export const WritableVector = <L extends NumberX, T extends Writable>(vlength: NumberClass<L>) => class {
  readonly #class = WritableVector(vlength)

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
}

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

export const Vector16 = <L extends NumberX>(vlength: NumberClass<L>) => class {
  readonly #class = Vector16(vlength)

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
    return vlength.size + (this.array.length * 2)
  }

  write(binary: Binary) {
    new vlength(this.array.length * 2).write(binary)

    for (const element of this.array)
      binary.writeUint16(element)
  }

  static read(binary: Binary) {
    const length = vlength.read(binary).value

    const start = binary.offset
    const array = new Array<number>()

    while (binary.offset - start < length)
      array.push(binary.readUint16())

    if (binary.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new this(array)
  }
}