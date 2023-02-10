import { Binary } from "@hazae41/binary"

export class Number24 {
  readonly #class = Number24

  static readonly size = 3 as const

  constructor(
    readonly value: number
  ) { }

  size() {
    return this.#class.size
  }

  write(cursor: Binary) {
    cursor.writeUint24(this.value)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary) {
    return new this(cursor.readUint24())
  }
}