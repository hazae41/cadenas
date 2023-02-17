import { Cursor } from "@hazae41/binary";
import { Unlengthed, Writable } from "mods/binary/fragment.js";
import { NumberClass, NumberX } from "mods/binary/numbers/number.js";
import { Vector } from "mods/binary/vectors/writable.js";

export const UnlengthedVector = <L extends NumberX, T extends Writable>(vlength: NumberClass<L>, clazz: Unlengthed<T>) => class {

  static read(cursor: Cursor) {
    const length = vlength.read(cursor).value
    const start = cursor.offset

    const value = clazz.read(cursor)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new (Vector(vlength))(value)
  }

}