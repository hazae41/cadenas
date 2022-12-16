import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/handshakes/handshake.js"
import { Number16, Number8 } from "mods/binary/number.js"
import { Random } from "mods/binary/random.js"
import { ArrayVector, Vector, Vector16, Vector8 } from "mods/binary/vector.js"
import { CipherSuite } from "mods/ciphers/cipher.js"

export class ClientHello2 {
  readonly class = ClientHello2

  static type = Handshake.types.client_hello

  constructor(
    readonly version: number,
    readonly random: Random,
    readonly session_id: Vector<Number8>,
    readonly cipher_suites: Vector<Number16>,
    readonly compression_methods: Vector<Number8>,
    readonly extensions?: Vector<Number16>
  ) { }

  get type() {
    return this.class.type
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

  handshake() {
    return Handshake.from(this)
  }
}