import { Binary } from "libs/binary.js";
import { NumberX } from "mods/binary/number.js";
import { Readable } from "mods/binary/readable.js";
import { Writable } from "mods/binary/writable.js";

export interface Vector<L extends NumberX> extends Writable {
  readonly vlength: L["class"]
}

export type BufferVector<L extends NumberX,> =
  InstanceType<ReturnType<typeof BufferVector<L>>>

export const BufferVector = <L extends NumberX>(vlength: L["class"]) => class {
  readonly class = BufferVector(vlength)

  constructor(
    readonly buffer: Buffer
  ) { }

  get vlength() {
    return vlength
  }

  static empty() {
    return new this(Buffer.allocUnsafe(0))
  }

  size() {
    return vlength.size + this.buffer.length
  }

  write(binary: Binary) {
    new vlength(this.buffer.length).write(binary)

    binary.write(this.buffer)
  }

  static read(binary: Binary) {
    const length = vlength.read(binary).value
    const buffer = binary.read(length)

    return new this(buffer)
  }
}

export const AnyVector = <L extends NumberX = any>(vlength: L["class"]) => class <T extends Writable = any> {
  readonly class = AnyVector(vlength)

  constructor(
    readonly value: T
  ) { }

  get vlength() {
    return vlength
  }

  size() {
    return vlength.size + this.value.size()
  }

  write(binary: Binary) {
    new vlength(this.value.size()).write(binary)

    this.value.write(binary)
  }
}

export type ArrayVector<L extends NumberX, T extends Writable & Readable<T>> =
  InstanceType<ReturnType<typeof ArrayVector<L, T>>>

export const ArrayVector = <L extends NumberX, T extends Writable & Readable<T>>(vlength: L["class"], type: T["class"]) => class {
  readonly class = ArrayVector(vlength, type)

  constructor(
    readonly array: T[]
  ) { }

  get vlength() {
    return vlength
  }

  size() {
    let size = vlength.size

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
      array.push(type.read(binary))

    if (binary.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new this(array)
  }
}

export const Vector8 = <L extends NumberX>(vlength: L["class"]) => class {
  readonly class = Vector8(vlength)

  constructor(
    readonly array: number[]
  ) { }

  get vlength() {
    return vlength
  }

  size() {
    return vlength.size + this.array.length
  }

  write(binary: Binary) {
    new vlength(this.array.length).write(binary)

    for (const element of this.array)
      binary.writeUint8(element)
  }
}

export const Vector16 = <L extends NumberX>(vlength: L["class"]) => class {
  readonly class = Vector16(vlength)

  constructor(
    readonly array: number[]
  ) { }

  get vlength() {
    return vlength
  }

  size() {
    return vlength.size + (this.array.length * 2)
  }

  write(binary: Binary) {
    new vlength(this.array.length * 2).write(binary)

    for (const element of this.array)
      binary.writeUint16(element)
  }
}