import { Binary } from "libs/binary.js";
import { NumberX } from "mods/binary/number.js";
import { Writable } from "mods/binary/writable.js";

export interface Vector<L extends NumberX = any> extends Writable {
  readonly vlength: L["class"]
}

export class BufferVector<L extends NumberX = any> {
  readonly class = BufferVector<L>

  constructor(
    readonly buffer: Buffer,
    readonly vlength: L["class"],
  ) { }

  static empty<L extends NumberX = any>(length: L["class"]) {
    return new this(Buffer.allocUnsafe(0), length)
  }

  size() {
    return this.vlength.size + this.buffer.length
  }

  write(binary: Binary) {
    new this.vlength(this.buffer.length).write(binary)

    binary.write(this.buffer)
  }

  static read<L extends NumberX = any>(binary: Binary, vlength: L["class"]) {
    const length = vlength.read(binary).value
    const buffer = binary.read(length)

    return new this(buffer, vlength)
  }
}

export class AnyVector<L extends NumberX = any, T extends Writable = any> {
  readonly class = AnyVector<L>

  constructor(
    readonly value: T,
    readonly vlength: L["class"],
  ) { }

  size() {
    return this.vlength.size + this.value.size()
  }

  write(binary: Binary) {
    new this.vlength(this.value.size()).write(binary)

    this.value.write(binary)
  }
}

export class ArrayVector<L extends NumberX = any, T extends Writable = any> {
  readonly class = ArrayVector<L, T>

  constructor(
    readonly array: T[],
    readonly vlength: L["class"],
  ) { }

  size() {
    let size = this.vlength.size

    for (const element of this.array)
      size += element.size()

    return size
  }

  write(binary: Binary) {
    let size = 0

    for (const element of this.array)
      size += element.size()

    new this.vlength(size).write(binary)

    for (const element of this.array)
      element.write(binary)
  }
}

export class Vector8<L extends NumberX = any> {
  readonly class = Vector8<L>

  constructor(
    readonly array: number[],
    readonly vlength: L["class"],
  ) { }

  size() {
    return this.vlength.size + this.array.length
  }

  write(binary: Binary) {
    new this.vlength(this.array.length).write(binary)

    for (const element of this.array)
      binary.writeUint8(element)
  }
}

export class Vector16<L extends NumberX = any> {
  readonly class = Vector16<L>

  constructor(
    readonly array: number[],
    readonly vlength: L["class"],
  ) { }

  size() {
    return this.vlength.size + (this.array.length * 2)
  }

  write(binary: Binary) {
    new this.vlength(this.array.length * 2).write(binary)

    for (const element of this.array)
      binary.writeUint16(element)
  }
}