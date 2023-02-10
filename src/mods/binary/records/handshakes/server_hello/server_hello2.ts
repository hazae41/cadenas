import { Binary } from "@hazae41/binary";
import { UnlengthedList } from "mods/binary/lists/unlengthed.js";
import { List } from "mods/binary/lists/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Number8 } from "mods/binary/numbers/number8.js";
import { Opaque, SafeOpaque } from "mods/binary/opaque.js";
import { Random } from "mods/binary/random.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";
import { Handshake } from "mods/binary/records/handshakes/handshake.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/writable.js";
import { Extensions, TypedExtension } from "../extensions/typed.js";

export class ServerHello2 {

  static readonly type = Handshake.types.server_hello

  constructor(
    readonly server_version: number,
    readonly random: Random,
    readonly session_id: Vector<Number8, Opaque>,
    readonly cipher_suite: number,
    readonly compression_methods: Vector<Number8, List<Number8>>,
    readonly extensions?: Vector<Number16, List<Extension<Extensions>>>
  ) { }

  size() {
    return 0
      + 2
      + this.random.size()
      + this.session_id.size()
      + 2
      + this.compression_methods.size()
      + (this.extensions?.size() ?? 0)
  }

  write(cursor: Binary) {
    cursor.writeUint16(this.server_version)
    this.random.write(cursor)
    this.session_id.write(cursor)
    cursor.writeUint16(this.cipher_suite)
    this.compression_methods.write(cursor)
    this.extensions?.write(cursor)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary, length: number) {
    const start = cursor.offset

    const server_version = cursor.readUint16()
    const random = Random.read(cursor)
    const session_id = LengthedVector(Number8, SafeOpaque).read(cursor)
    const cipher_suite = cursor.readUint16()
    const compression_methods = LengthedVector(Number8, UnlengthedList(Number8)).read(cursor)

    const extensions = cursor.offset - start < length
      ? LengthedVector(Number16, UnlengthedList(TypedExtension)).read(cursor)
      : undefined

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(server_version, random, session_id, cipher_suite, compression_methods, extensions)
  }
}