import { Binary } from "@hazae41/binary";
import { Lengthed, Writable } from "mods/binary/fragment.js";
import { NumberClass, NumberX } from "mods/binary/numbers/number.js";
import { Vector } from "mods/binary/vectors/writable.js";

export const LengthedVector = <L extends NumberX, T extends Writable>(vlength: NumberClass<L>, clazz: Lengthed<T>) => class {

  static read(cursor: Binary) {
    const length = vlength.read(cursor).value
    const start = cursor.offset

    const value = clazz.read(cursor, length)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new (Vector(vlength))(value)
  }

}