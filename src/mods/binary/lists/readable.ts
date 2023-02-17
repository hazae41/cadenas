import { Cursor, Readable, Writable } from "@hazae41/binary"
import { List } from "mods/binary/lists/writable.js"

export const ReadableList = <T extends Writable>(readable: Readable<T>) => class {

  static read(cursor: Cursor) {
    const array = new Array<T>()

    while (cursor.remaining)
      array.push(readable.read(cursor))

    return new List(array)
  }

}