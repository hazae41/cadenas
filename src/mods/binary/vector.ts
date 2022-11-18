import { Binary } from "libs/binary.js";
import { NumberX } from "mods/binary/number.js";
import { Writable } from "mods/binary/writable.js";

export interface Vector<L extends NumberX = any> extends Writable {
  readonly length: L["class"]
}

export class BufferVector<L extends NumberX = any> {
  readonly class = BufferVector<L>

  constructor(
    readonly buffer: Buffer,
    readonly length: L["class"],
  ) { }

  static empty<L extends NumberX = any>(length: L["class"]) {
    return new this(Buffer.allocUnsafe(0), length)
  }

  size() {
    return this.length.size + this.buffer.length
  }

  write(binary: Binary) {
    new this.length(this.buffer.length).write(binary)

    binary.write(this.buffer)
  }
}

export class AnyVector<L extends NumberX = any, T extends Writable = any> {
  readonly class = AnyVector<L>

  constructor(
    readonly value: T,
    readonly length: L["class"],
  ) { }

  size() {
    return this.length.size + this.value.size()
  }

  write(binary: Binary) {
    new this.length(this.value.size()).write(binary)

    this.value.write(binary)
  }
}

export class ArrayVector<L extends NumberX = any, T extends Writable = any> {
  readonly class = ArrayVector<L, T>

  constructor(
    readonly array: T[],
    readonly length: L["class"],
  ) { }

  size() {
    let size = this.length.size

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
    return this.length.size + this.array.length
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
    return this.length.size + (this.array.length * 2)
  }

  write(binary: Binary) {
    new this.length(this.array.length).write(binary)

    for (const element of this.array)
      binary.writeUint16(element)
  }
}