import { Cursor } from "@hazae41/binary"

export class Number8 {
  readonly #class = Number8

  static readonly size = 1 as const

  constructor(
    readonly value: number
  ) { }

  size() {
    return this.#class.size
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.value)
  }

  static read(cursor: Cursor) {
    return new this(cursor.readUint8())
  }
}