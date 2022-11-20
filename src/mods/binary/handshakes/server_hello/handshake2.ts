import { Binary } from "libs/binary.js";
import { Number16, Number8 } from "mods/binary/number.js";
import { Random } from "mods/binary/random.js";
import { BufferVector, Vector } from "mods/binary/vector.js";
import { Handshake } from "../handshake.js";

export class ServerHello2 {
  readonly class = ServerHello2

  static type = Handshake.types.server_hello

  constructor(
    readonly server_version: number,
    readonly random: Random,
    readonly session_id: Vector<Number8>,
    readonly cipher_suite: number,
    readonly compression_methods: Vector<Number8>,
    readonly extensions?: Vector<Number16>
  ) { }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const server_version = binary.readUint16()
    const random = Random.read(binary)
    const session_id = BufferVector.read<Number8>(binary, Number8)
    const cipher_suite = binary.readUint16()
    const compression_methods = BufferVector.read<Number8>(binary, Number8)

    if (binary.offset - start > length)
      throw new Error(`Invalid ${this.name} length`)

    const extensions = binary.offset - start < length
      ? BufferVector.read<Number16>(binary, Number16)
      : undefined

    return new this(server_version, random, session_id, cipher_suite, compression_methods, extensions)
  }
}