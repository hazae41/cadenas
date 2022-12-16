import { Binary } from "@hazae41/binary";
import { Number16, Number8 } from "mods/binary/number.js";
import { Random } from "mods/binary/random.js";
import { BufferVector, Vector } from "mods/binary/vector.js";
import { Handshake } from "../handshake.js";

export class ServerHello2 {
  readonly #class = ServerHello2

  static type = Handshake.types.server_hello

  constructor(
    readonly server_version: number,
    readonly random: Random,
    readonly session_id: Vector<Number8>,
    readonly cipher_suite: number,
    readonly compression_methods: Vector<Number8>,
    readonly extensions?: Vector<Number16>
  ) { }

  get class() {
    return this.#class
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const server_version = binary.readUint16()
    const random = Random.read(binary)
    const session_id = BufferVector<Number8>(Number8).read(binary)
    const cipher_suite = binary.readUint16()
    const compression_methods = BufferVector<Number8>(Number8).read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    const extensions = binary.offset - start < length
      ? BufferVector<Number16>(Number16).read(binary)
      : undefined

    return new this(server_version, random, session_id, cipher_suite, compression_methods, extensions)
  }
}