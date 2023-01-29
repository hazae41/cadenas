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

  write(binary: Binary) {
    binary.writeUint16(this.server_version)
    this.random.write(binary)
    this.session_id.write(binary)
    binary.writeUint16(this.cipher_suite)
    this.compression_methods.write(binary)
    this.extensions?.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const server_version = binary.readUint16()
    const random = Random.read(binary)
    const session_id = LengthedVector(Number8, SafeOpaque).read(binary)
    const cipher_suite = binary.readUint16()
    const compression_methods = LengthedVector(Number8, UnlengthedList(Number8)).read(binary)

    const extensions = binary.offset - start < length
      ? LengthedVector(Number16, UnlengthedList(TypedExtension)).read(binary)
      : undefined

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(server_version, random, session_id, cipher_suite, compression_methods, extensions)
  }
}