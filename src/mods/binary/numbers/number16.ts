import { Cursor } from "@hazae41/binary"

export class Number16 {
  readonly #class = Number16

  static readonly size = 2 as const

  constructor(
    readonly value: number
  ) { }

  size() {
    return this.#class.size
  }

  write(cursor: Cursor) {
    cursor.writeUint16(this.value)
  }

  static read(cursor: Cursor) {
    return new this(cursor.readUint16())
  }
}