import { Cursor, Readable, Writable } from "@hazae41/binary";
import { NumberClass, NumberX } from "mods/binary/numbers/number.js";
import { Vector } from "mods/binary/vectors/writable.js";

export const ReadableVector = <L extends NumberX, T extends Writable>(vlength: NumberClass<L>, readable: Readable<T>) => class {

  static read(cursor: Cursor) {
    const length = vlength.read(cursor).value

    const value = Readable.fromBytes(readable, cursor.read(length))

    return new (Vector(vlength))(value)
  }

}