import { Cursor, CursorReadUnknownError, CursorWriteUnknownError } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Record } from "mods/binary/records/record.js";

export class ChangeCipherSpec {
  readonly #class = ChangeCipherSpec

  static readonly type = Record.types.change_cipher_spec

  static readonly types = {
    change_cipher_spec: 1
  } as const

  constructor(
    readonly subtype: number = ChangeCipherSpec.types.change_cipher_spec
  ) { }

  static new(subtype?: number) {
    return new ChangeCipherSpec(subtype)
  }

  get type() {
    return this.#class.type
  }

  trySize(): Result<number, never> {
    return new Ok(1)
  }

  tryWrite(cursor: Cursor): Result<void, CursorWriteUnknownError> {
    return cursor.tryWriteUint8(this.subtype)
  }

  static tryRead(cursor: Cursor): Result<ChangeCipherSpec, CursorReadUnknownError> {
    return cursor.tryReadUint8().mapSync(ChangeCipherSpec.new)
  }

}