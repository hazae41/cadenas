import { Binary } from "@hazae41/binary"

export class Number16 {
  readonly #class = Number16

  static readonly size = 2 as const

  constructor(
    readonly value: number
  ) { }

  size() {
    return this.#class.size
  }

  write(cursor: Binary) {
    cursor.writeUint16(this.value)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary) {
    return new this(cursor.readUint16())
  }
}