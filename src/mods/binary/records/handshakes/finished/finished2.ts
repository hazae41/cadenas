import { BinaryReadError, BinaryWriteError } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"

export class Finished2 {
  readonly #class = Finished2

  static readonly handshake_type = Handshake.types.finished

  constructor(
    readonly verify_data: Uint8Array
  ) { }

  static new(verify_data: Uint8Array) {
    return new Finished2(verify_data)
  }

  get handshake_type() {
    return this.#class.handshake_type
  }

  trySize(): Result<number, never> {
    return new Ok(this.verify_data.length)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return cursor.tryWrite(this.verify_data)
  }

  static tryRead(cursor: Cursor): Result<Finished2, BinaryReadError> {
    return cursor.tryRead(cursor.remaining).mapSync(Finished2.new)
  }

}