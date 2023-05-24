import { BinaryReadError, Readable, Writable } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { NumberClass, NumberX } from "mods/binary/numbers/number.js";
import { Vector } from "mods/binary/vectors/writable.js";

export const ReadableVector = <L extends NumberX, W extends Writable.Infer<W>, ReadError>(vlength: NumberClass<L>, readable: Readable<W, ReadError>) => class {

  static tryRead(cursor: Cursor): Result<Vector<L, W>, ReadError | BinaryReadError> {
    return Result.unthrowSync(t => {
      const length = vlength.tryRead(cursor).throw(t).value
      const bytes = cursor.tryRead(length).throw(t)
      const value = Readable.tryReadFromBytes(readable, bytes).throw(t)

      return new Ok(new (Vector(vlength))(value))
    })
  }

}