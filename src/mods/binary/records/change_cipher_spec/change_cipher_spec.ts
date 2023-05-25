import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Record } from "mods/binary/records/record.js";

export class ChangeCipherSpec {
  readonly #class = ChangeCipherSpec

  static readonly record_type = Record.types.change_cipher_spec

  static readonly types = {
    change_cipher_spec: 1
  } as const

  constructor(
    readonly type: number = ChangeCipherSpec.types.change_cipher_spec
  ) { }

  static new(type?: number) {
    return new ChangeCipherSpec(type)
  }

  get record_type() {
    return this.#class.record_type
  }

  trySize(): Result<number, never> {
    return new Ok(1)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return cursor.tryWriteUint8(this.type)
  }

  static tryRead(cursor: Cursor): Result<ChangeCipherSpec, BinaryReadError> {
    return cursor.tryReadUint8().mapSync(ChangeCipherSpec.new)
  }

}