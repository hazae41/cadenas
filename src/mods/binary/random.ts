import { Cursor } from "@hazae41/binary"
import { Bytes } from "@hazae41/bytes"

export class Random {
  constructor(
    readonly gmt_unix_time: number,
    readonly random_bytes: Uint8Array
  ) { }

  static default() {
    const gmt_unix_time = ~~(Date.now() / 1000)
    const random_bytes = Bytes.random(28)

    return new this(gmt_unix_time, random_bytes)
  }

  size() {
    return 4 + this.random_bytes.length
  }

  write(cursor: Cursor) {
    cursor.writeUint32(this.gmt_unix_time)
    cursor.write(this.random_bytes)
  }

  static read(cursor: Cursor) {
    const gmt_unix_time = cursor.readUint32()
    const random_bytes = new Uint8Array(cursor.read(28))

    return new this(gmt_unix_time, random_bytes)
  }
}