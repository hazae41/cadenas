import { Cursor } from "@hazae41/binary"

export class Number24 {
  readonly #class = Number24

  static readonly size = 3 as const

  constructor(
    readonly value: number
  ) { }

  size() {
    return this.#class.size
  }

  write(cursor: Cursor) {
    cursor.writeUint24(this.value)
  }

  static read(cursor: Cursor) {
    return new this(cursor.readUint24())
  }
}