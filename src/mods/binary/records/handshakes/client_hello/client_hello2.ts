import { BinaryReadError, BinaryWriteError, Opaque, SafeOpaque } from "@hazae41/binary"
import { Bytes } from "@hazae41/bytes"
import { Cursor } from "@hazae41/cursor"
import { None, Option, Some } from "@hazae41/option"
import { Ok, Result } from "@hazae41/result"
import { ReadableList } from "mods/binary/lists/readable.js"
import { List } from "mods/binary/lists/writable.js"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Number8 } from "mods/binary/numbers/number8.js"
import { Random } from "mods/binary/random.js"
import { ECPointFormats } from "mods/binary/records/handshakes/extensions/ec_point_formats/ec_point_formats.js"
import { EllipticCurves } from "mods/binary/records/handshakes/extensions/elliptic_curves/elliptic_curves.js"
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js"
import { OpaqueExtension } from "mods/binary/records/handshakes/extensions/opaque.js"
import { ResolvedExtension } from "mods/binary/records/handshakes/extensions/resolved.js"
import { SignatureAlgorithms } from "mods/binary/records/handshakes/extensions/signature_algorithms/signature_algorithms.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ReadableVector } from "mods/binary/vectors/readable.js"
import { Vector } from "mods/binary/vectors/writable.js"
import { Cipher } from "mods/ciphers/cipher.js"
import { ServerName } from "../extensions/server_name/server_name.js"
import { ServerNameList } from "../extensions/server_name/server_name_list.js"

export class ClientHello2 {
  readonly #class = ClientHello2

  static readonly handshake_type = Handshake.types.client_hello

  constructor(
    readonly version: number,
    readonly random: Random,
    readonly session_id: Vector<Number8, Opaque>,
    readonly cipher_suites: Vector<Number16, List<Number16>>,
    readonly compression_methods: Vector<Number8, List<Number8>>,
    readonly extensions: Option<Vector<Number16, List<Extension<ResolvedExtension>>>>
  ) { }

  get handshake_type() {
    return this.#class.handshake_type
  }

  static default(ciphers: Cipher[], host_name?: string) {
    const version = 0x0303
    const random = Random.default()

    const session_id = Vector(Number8).from(new Opaque(Bytes.tryEmpty().unwrap()))
    const cipher_suites = Vector(Number16).from(List.from(ciphers.map(it => new Number16(it.id))))
    const compression_methods = Vector(Number8).from(List.from([new Number8(0)]))

    const extensions = new Some(Vector(Number16).from(List.from<Extension<ResolvedExtension>>([])))

    if (host_name) {
      const server_name = Extension.from(ServerNameList.from([ServerName.from(host_name)]))
      extensions.inner.value.array.push(server_name)
    }

    const signature_algorithms = Extension.from(SignatureAlgorithms.default())
    const elliptic_curves = Extension.from(EllipticCurves.default())
    const ec_point_formats = Extension.from(ECPointFormats.default())
    extensions.inner.value.array.push(signature_algorithms, elliptic_curves, ec_point_formats)

    return new this(version, random, session_id, cipher_suites, compression_methods, extensions)
  }

  trySize(): Result<number, never> {
    return new Ok(0
      + 2
      + this.random.trySize().get()
      + this.session_id.trySize().get()
      + this.cipher_suites.trySize().get()
      + this.compression_methods.trySize().get()
      + this.extensions.mapOrSync(0, x => x.trySize().get()))
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      cursor.tryWriteUint16(this.version).throw(t)
      this.random.tryWrite(cursor).throw(t)
      this.session_id.tryWrite(cursor).throw(t)
      this.cipher_suites.tryWrite(cursor).throw(t)
      this.compression_methods.tryWrite(cursor).throw(t)
      this.extensions.mapSync(x => x.tryWrite(cursor).throw(t))

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<ClientHello2, BinaryReadError> {
    return Result.unthrowSync(t => {
      const version = cursor.tryReadUint16().throw(t)
      const random = Random.tryRead(cursor).throw(t)
      const session_id = ReadableVector(Number8, SafeOpaque).tryRead(cursor).throw(t)
      const cipher_suites = ReadableVector(Number16, ReadableList(Number16)).tryRead(cursor).throw(t)
      const compression_methods = ReadableVector(Number8, ReadableList(Number8)).tryRead(cursor).throw(t)

      const extensions = cursor.remaining > 0
        ? new Some(ReadableVector(Number16, ReadableList(OpaqueExtension)).tryRead(cursor).throw(t))
        : new None()

      return new Ok(new ClientHello2(version, random, session_id, cipher_suites, compression_methods, extensions))
    })
  }

}