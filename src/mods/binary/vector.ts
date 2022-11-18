import { Binary } from "libs/binary.js";

export interface Writable {
  size(): number
  write(binary: Binary): void
}

export class Opaque {
  readonly class = Opaque

  constructor(
    readonly buffer: Buffer
  ) { }

  size() {
    return this.buffer.length
  }

  write(binary: Binary) {
    binary.write(this.buffer)
  }
}

export type NumberX =
  | Number8
  | Number16

export class Number8 {
  readonly class = Number8

  static size: 1 = 1

  constructor(
    readonly length: number
  ) { }

  size() {
    return 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.length)
  }
}

export class Number16 {
  readonly class = Number16

  static size: 2 = 2

  constructor(
    readonly length: number
  ) { }

  size() {
    return 2
  }

  write(binary: Binary) {
    binary.writeUint16(this.length)
  }
}

export class Vector<L extends NumberX = any, T extends Writable = any> {
  readonly class = Vector<L, T>

  constructor(
    readonly array: T[],
    readonly length: L["class"],
  ) { }

  size() {
    let size = new this.length(this.array.length).size()

    for (const element of this.array)
      size += element.size()

    return size
  }

  write(binary: Binary) {
    new this.length(this.array.length).write(binary)

    for (const element of this.array)
      element.write(binary)
  }
}

export class Vector8<L extends NumberX = any> {
  readonly class = Vector8<L>

  constructor(
    readonly array: number[],
    readonly length: L["class"],
  ) { }

  size() {
    return new this.length(this.array.length).size() + this.array.length
  }

  write(binary: Binary) {
    new this.length(this.array.length).write(binary)

    for (const element of this.array)
      binary.writeUint8(element)
  }
}

export class Vector16<L extends NumberX = any> {
  readonly class = Vector16<L>

  constructor(
    readonly array: number[],
    readonly length: L["class"],
  ) { }

  size() {
    return new this.length(this.array.length).size() + (this.array.length * 2)
  }

  write(binary: Binary) {
    new this.length(this.array.length).write(binary)

    for (const element of this.array)
      binary.writeUint16(element)
  }
}

export class OpaqueVector<L extends NumberX = any> {
  readonly class = OpaqueVector<L>

  constructor(
    readonly buffer: Buffer,
    readonly length: L["class"],
  ) { }

  static empty<L extends NumberX = any>(length: L["class"]) {
    return new this(Buffer.allocUnsafe(0), length)
  }

  size() {
    return new this.length(this.buffer.length).size() + this.buffer.length
  }

  write(binary: Binary) {
    new this.length(this.buffer.length).write(binary)

    binary.write(this.buffer)
  }
}