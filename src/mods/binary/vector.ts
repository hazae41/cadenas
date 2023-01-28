import { Binary } from "@hazae41/binary";
import { Bytes } from "libs/bytes/bytes.js";
import { NumberClass, NumberX } from "mods/binary/number.js";
import { Lengthed, LengthedClass, Unlengthed, UnlengthedClass } from "./fragment.js";
import { Writable } from "./writable.js";

export interface Vector<L extends NumberX> extends Writable {
  readonly vlength: NumberClass<L>
}

export type BytesVector<L extends NumberX> =
  InstanceType<ReturnType<typeof BytesVector<L>>>

export const BytesVector = <L extends NumberX>(vlength: NumberClass<L>) => class {
  readonly #class = BytesVector(vlength)

  constructor(
    readonly bytes: Uint8Array
  ) { }

  static from(bytes: Uint8Array) {
    return new this(bytes)
  }

  get vlength() {
    return vlength
  }

  static empty() {
    return new this(Bytes.allocUnsafe(0))
  }

  get class() {
    return this.#class
  }

  size() {
    return vlength.size + this.bytes.length
  }

  write(binary: Binary) {
    new vlength(this.bytes.length).write(binary)

    binary.write(this.bytes)
  }

  static read(binary: Binary) {
    const length = vlength.read(binary).value
    const buffer = new Uint8Array(binary.read(length))

    return new this(buffer)
  }
}

export type LengthedVector<L extends NumberX, T extends Lengthed<T>> =
  InstanceType<ReturnType<typeof LengthedVector<L, T>>>

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

export type ArrayVector<L extends NumberX, T extends Unlengthed<T>> =
  InstanceType<ReturnType<typeof ArrayVector<L, T>>>

export const ArrayVector = <L extends NumberX, T extends Unlengthed<T>>(vlength: NumberClass<L>, clazz: UnlengthedClass<T>) => class {
  readonly #class = ArrayVector(vlength, clazz)

  constructor(
    readonly array: T[]
  ) { }

  static from(array: T[]) {
    return new this(array)
  }

  get vlength() {
    return vlength
  }

  get class() {
    return this.#class
  }

  size() {
    let size: number = vlength.size

    for (const element of this.array)
      size += element.size()

    return size
  }

  write(binary: Binary) {
    let size = 0

    for (const element of this.array)
      size += element.size()

    new vlength(size).write(binary)

    for (const element of this.array)
      element.write(binary)
  }

  static read(binary: Binary) {
    const length = vlength.read(binary).value

    const start = binary.offset
    const array = new Array<T>()

    while (binary.offset - start < length)
      array.push(clazz.read(binary))

    if (binary.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new this(array)
  }
}

export type Vector8<L extends NumberX> =
  InstanceType<ReturnType<typeof Vector8<L>>>

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

export type Vector16<L extends NumberX> =
  InstanceType<ReturnType<typeof Vector16<L>>>

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