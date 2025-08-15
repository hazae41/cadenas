import { Cursor } from "@hazae41/cursor"
import { Lengthed } from "@hazae41/lengthed"

export type Bytes<N extends number = number> = Uint8Array<ArrayBuffer> & Lengthed<N>

export namespace Bytes {

  export function concat(...arrays: Uint8Array[]): Uint8Array<ArrayBuffer> {
    const length = arrays.reduce((a, b) => a + b.length, 0)
    const result = new Cursor(new Uint8Array(length))

    for (const array of arrays)
      result.writeOrThrow(array)

    return result.bytes
  }

}