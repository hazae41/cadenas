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

export class Vector<T extends Writable> {
  readonly class = Vector<T>

  constructor(
    readonly array: T[],
    readonly length: NumberX["class"],
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