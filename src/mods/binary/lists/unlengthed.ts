import { Binary } from "@hazae41/binary"
import { UnlengthedClass, Writable } from "mods/binary/fragment.js"
import { List } from "mods/binary/lists/writable.js"

export const UnlengthedList = <T extends Writable>(clazz: UnlengthedClass<T>) => class {

  static read(binary: Binary, length: number) {
    const start = binary.offset
    const array = new Array<T>()

    while (binary.offset - start < length)
      array.push(clazz.read(binary))

    if (binary.offset - start !== length)
      throw new Error(`Invalid array length`)

    return new List(array)
  }

}