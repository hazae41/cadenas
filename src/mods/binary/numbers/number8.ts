import { Binary } from "@hazae41/binary"

export class Number8 {
  readonly #class = Number8

  static readonly size = 1 as const

  constructor(
    readonly value: number
  ) { }

  size() {
    return this.#class.size
  }

  write(cursor: Binary) {
    cursor.writeUint8(this.value)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary) {
    return new this(cursor.readUint8())
  }
}