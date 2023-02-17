import { Cursor } from "@hazae41/binary"
import { UnlengthedList } from "mods/binary/lists/unlengthed.js"
import { List } from "mods/binary/lists/writable.js"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Number8 } from "mods/binary/numbers/number8.js"
import { Opaque, SafeOpaque } from "mods/binary/opaque.js"
import { Random } from "mods/binary/random.js"
import { ECPointFormats } from "mods/binary/records/handshakes/extensions/ec_point_formats/ec_point_formats.js"
import { EllipticCurves } from "mods/binary/records/handshakes/extensions/elliptic_curves/elliptic_curves.js"
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js"
import { OpaqueExtension } from "mods/binary/records/handshakes/extensions/opaque.js"
import { SignatureAlgorithms } from "mods/binary/records/handshakes/extensions/signature_algorithms/signature_algorithms.js"
import { Extensions } from "mods/binary/records/handshakes/extensions/typed.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { LengthedVector } from "mods/binary/vectors/lengthed.js"
import { Vector } from "mods/binary/vectors/writable.js"
import { Cipher } from "mods/ciphers/cipher.js"

export class ClientHello2 {
  readonly #class = ClientHello2

  static readonly type = Handshake.types.client_hello

  constructor(
    readonly version: number,
    readonly random: Random,
    readonly session_id: Vector<Number8, Opaque>,
    readonly cipher_suites: Vector<Number16, List<Number16>>,
    readonly compression_methods: Vector<Number8, List<Number8>>,
    readonly extensions?: Vector<Number16, List<Extension<Extensions>>>
  ) { }

  get type() {
    return this.#class.type
  }

  static default(ciphers: Cipher[]) {
    const version = 0x0303
    const random = Random.default()

    const session_id = Vector(Number8).from(Opaque.empty())
    const cipher_suites = Vector(Number16).from(List.from(ciphers.map(it => new Number16(it.id))))
    const compression_methods = Vector(Number8).from(List.from([new Number8(0)]))

    const signature_algorithms = SignatureAlgorithms.default().extension()
    const elliptic_curves = EllipticCurves.default().extension()
    const ec_point_formats = ECPointFormats.default().extension()

    const extensions = Vector(Number16).from(List.from([signature_algorithms, elliptic_curves, ec_point_formats]))

    return new this(version, random, session_id, cipher_suites, compression_methods, extensions)
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

  write(cursor: Cursor) {
    cursor.writeUint16(this.version)
    this.random.write(cursor)
    this.session_id.write(cursor)
    this.cipher_suites.write(cursor)
    this.compression_methods.write(cursor)
    this.extensions?.write(cursor)
  }

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset

    const version = cursor.readUint16()
    const random = Random.read(cursor)

    const session_id = LengthedVector(Number8, SafeOpaque).read(cursor)
    const cipher_suites = LengthedVector(Number16, UnlengthedList(Number16)).read(cursor)
    const compression_methods = LengthedVector(Number8, UnlengthedList(Number8)).read(cursor)

    const extensions = cursor.offset - start !== length
      ? LengthedVector(Number16, UnlengthedList(OpaqueExtension)).read(cursor)
      : undefined

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(version, random, session_id, cipher_suites, compression_methods, extensions)
  }

  handshake() {
    return new Handshake(this.type, this)
  }

}