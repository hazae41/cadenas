import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/handshakes/handshake.js"
import { Number16, Number8 } from "mods/binary/number.js"
import { Random } from "mods/binary/random.js"
import { ArrayVector, Vector, Vector16, Vector8 } from "mods/binary/vector.js"
import { CipherSuite } from "mods/ciphers/cipher.js"

export class ClientHello2 {
  readonly #class = ClientHello2

  static type = Handshake.types.client_hello

  constructor(
    readonly version: number,
    readonly random: Random,
    readonly session_id: Vector<Number8>,
    readonly cipher_suites: Vector<Number16>,
    readonly compression_methods: Vector<Number8>,
    readonly extensions?: Vector<Number16>
  ) { }

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
  }

  static default(ciphers: CipherSuite[]) {
    const version = 0x0303
    const random = Random.default()

    const session_id = new (ArrayVector<Number8, Number8>(Number8, Number8))([])
    const cipher_suites = new (Vector16<Number16>(Number16))(ciphers.map(it => it.id))
    const compression_methods = new (Vector8<Number8>(Number8))([0])

    return new this(version, random, session_id, cipher_suites, compression_methods)
  }

  size() {
    return 0
      + 2
      + this.random.size()
      + this.session_id.size()
      + this.cipher_suites.size()
      + this.compression_methods.size()
      + (this.extensions?.size() ?? 0)
  }

  write(binary: Binary) {
    binary.writeUint16(this.version)
    this.random.write(binary)
    this.session_id.write(binary)
    this.cipher_suites.write(binary)
    this.compression_methods.write(binary)
    this.extensions?.write(binary)
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const version = binary.readUint16()
    const random = Random.read(binary)

    const session_id = ArrayVector<Number8, Number8>(Number8, Number8).read(binary)
    const cipher_suites = Vector16<Number16>(Number16).read(binary)
    const compression_methods = Vector8<Number8>(Number8).read(binary)

    const extensions = binary.offset - start !== length
      ? Vector8<Number16>(Number16).read(binary)
      : undefined

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(version, random, session_id, cipher_suites, compression_methods, extensions)
  }

  handshake() {
    return new Handshake(this.type, this)
  }
}