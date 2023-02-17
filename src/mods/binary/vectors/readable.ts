import { Cursor, Readable, UnsafeOpaque, Writable } from "@hazae41/binary";
import { NumberClass, NumberX } from "mods/binary/numbers/number.js";
import { Vector } from "mods/binary/vectors/writable.js";

export const ReadableVector = <L extends NumberX, T extends Writable>(vlength: NumberClass<L>, readable: Readable<T>) => class {

  static read(cursor: Cursor) {
    const length = vlength.read(cursor).value

    const subcursor = new Cursor(cursor.read(length))
    const opaque = UnsafeOpaque.read(subcursor)
    const value = opaque.into(readable)

    return new (Vector(vlength))(value)
  }

}