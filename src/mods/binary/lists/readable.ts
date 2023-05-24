import { Readable, Writable } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { List } from "mods/binary/lists/writable.js"

export const ReadableList = <W extends Writable.Infer<W>, ReadError>(readable: Readable<W, ReadError>) => class {

  static tryRead(cursor: Cursor): Result<List<W>, ReadError> {
    return Result.unthrowSync(t => {
      const array = new Array<W>()

      while (cursor.remaining)
        array.push(readable.tryRead(cursor).throw(t))

      return new Ok(new List(array))
    })
  }

}