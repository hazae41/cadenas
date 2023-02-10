import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"

export class ServerHelloDone2 {

  static readonly type = Handshake.types.server_hello_done

  constructor() { }

  size() {
    return 0
  }

  write(cursor: Binary) {
    /**
     * NOOP
     */
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary, length: number) {
    const start = cursor.offset

    /**
     * NOOP
     */

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this()
  }
}