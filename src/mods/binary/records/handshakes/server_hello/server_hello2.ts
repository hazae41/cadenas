import { BinaryReadError, BinaryWriteError, Opaque, SafeOpaque } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { None, Option, Some } from "@hazae41/option";
import { Ok, Result } from "@hazae41/result";
import { ReadableList } from "mods/binary/lists/readable.js";
import { List } from "mods/binary/lists/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Number8 } from "mods/binary/numbers/number8.js";
import { Random } from "mods/binary/random.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";
import { Handshake } from "mods/binary/records/handshakes/handshake.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";
import { ResolvedExtension } from "../extensions/resolved.js";

export class ServerHello2 {

  static readonly type = Handshake.types.server_hello

  constructor(
    readonly server_version: number,
    readonly random: Random,
    readonly session_id: Vector<Number8, Opaque>,
    readonly cipher_suite: number,
    readonly compression_methods: Vector<Number8, List<Number8>>,
    readonly extensions: Option<Vector<Number16, List<Extension<ResolvedExtension>>>>
  ) { }

  trySize(): Result<number, never> {
    return new Ok(0
      + 2
      + this.random.trySize().get()
      + this.session_id.trySize().get()
      + 2
      + this.compression_methods.trySize().get()
      + this.extensions.mapOrSync(0, x => x.trySize().get()))
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      cursor.tryWriteUint16(this.server_version).throw(t)
      this.random.tryWrite(cursor).throw(t)
      this.session_id.tryWrite(cursor).throw(t)
      cursor.tryWriteUint16(this.cipher_suite).throw(t)
      this.compression_methods.tryWrite(cursor).throw(t)
      this.extensions.mapSync(x => x.tryWrite(cursor).throw(t))

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<ServerHello2, BinaryReadError> {
    return Result.unthrowSync(t => {
      const server_version = cursor.tryReadUint16().throw(t)
      const random = Random.tryRead(cursor).throw(t)
      const session_id = ReadableVector(Number8, SafeOpaque).tryRead(cursor).throw(t)
      const cipher_suite = cursor.tryReadUint16().throw(t)
      const compression_methods = ReadableVector(Number8, ReadableList(Number8)).tryRead(cursor).throw(t)

      const extensions = cursor.remaining > 0
        ? new Some(ReadableVector(Number16, ReadableList(ResolvedExtension)).tryRead(cursor).throw(t))
        : new None()

      return new Ok(new ServerHello2(server_version, random, session_id, cipher_suite, compression_methods, extensions))
    })
  }

}