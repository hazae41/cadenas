import { Cursor } from "@hazae41/cursor"

export namespace Bytes {

  export function concat(...arrays: Uint8Array[]): Uint8Array<ArrayBuffer> {
    const length = arrays.reduce((a, b) => a + b.length, 0)
    const result = new Cursor(new Uint8Array(length))

    for (const array of arrays)
      result.writeOrThrow(array)

    return result.bytes
  }

}