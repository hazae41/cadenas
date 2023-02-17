import { Cursor } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"

export class ServerHelloDone2 {

  static readonly type = Handshake.types.server_hello_done

  constructor() { }

  size() {
    return 0
  }

  write(cursor: Cursor) {
    /**
     * NOOP
     */
  }

  static read(cursor: Cursor) {
    /**
     * NOOP
     */

    return new this()
  }
}