import { Cursor, Writable } from "@hazae41/binary"
import { Unlengthed } from "mods/binary/fragment.js"
import { List } from "mods/binary/lists/writable.js"

export const UnlengthedList = <T extends Writable>(clazz: Unlengthed<T>) => class {

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset
    const array = new Array<T>()

    while (cursor.offset - start < length)
      array.push(clazz.read(cursor))

    if (cursor.offset - start !== length)
      throw new Error(`Invalid array length`)

    return new List(array)
  }

}