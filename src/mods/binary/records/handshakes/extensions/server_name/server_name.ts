import { BinaryReadError, BinaryWriteError, Opaque, SafeOpaque } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { Number16 } from "mods/binary/numbers/number16.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";
import { NameType } from "./name_type.js";

export class ServerName {

  constructor(
    readonly name_type: NameType,
    readonly host_name: Vector<Number16, Opaque>
  ) { }

  static new(name_type: NameType, host_name: Vector<Number16, Opaque>) {
    return new ServerName(name_type, host_name)
  }

  static from(host_name: string) {
    return new ServerName(NameType.instances.host_name, Vector(Number16).from(new Opaque(Bytes.fromAscii(host_name))))
  }

  trySize(): Result<number, never> {
    return Result.unthrowSync(t => {
      const name_type = this.name_type.trySize().throw(t)
      const host_name = this.host_name.trySize().throw(t)

      return new Ok(name_type + host_name)
    })
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      this.name_type.tryWrite(cursor).throw(t)
      this.host_name.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<ServerName, BinaryReadError> {
    return Result.unthrowSync(t => {
      const name_type = NameType.tryRead(cursor).throw(t)
      const host_name = ReadableVector(Number16, SafeOpaque).tryRead(cursor).throw(t)

      return new Ok(new ServerName(name_type, host_name))
    })
  }

}