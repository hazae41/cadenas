import { Cursor } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"

export class Finished2 {
  readonly #class = Finished2

  static readonly type = Handshake.types.finished

  constructor(
    readonly verify_data: Uint8Array
  ) { }

  get type() {
    return this.#class.type
  }

  size() {
    return this.verify_data.length
  }

  write(cursor: Cursor) {
    cursor.write(this.verify_data)
  }

  handshake() {
    return new Handshake(this.type, this)
  }

  static read(cursor: Cursor) {
    const verify_data = cursor.read(cursor.remaining)

    return new this(verify_data)
  }
}