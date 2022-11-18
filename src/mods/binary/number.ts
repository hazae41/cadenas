import { Binary } from "libs/binary.js"

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
    return this.class.size
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
    return this.class.size
  }

  write(binary: Binary) {
    binary.writeUint16(this.length)
  }
}