import { Cursor } from "@hazae41/binary"
import { UnlengthedList } from "mods/binary/lists/unlengthed.js"
import { List } from "mods/binary/lists/writable.js"
import { Number24 } from "mods/binary/numbers/number24.js"
import { Opaque, SafeOpaque } from "mods/binary/opaque.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { LengthedVector } from "mods/binary/vectors/lengthed.js"
import { Vector } from "mods/binary/vectors/writable.js"

export class Certificate2 {
  readonly #class = Certificate2

  static readonly type = Handshake.types.certificate

  constructor(
    readonly certificate_list: Vector<Number24, List<Vector<Number24, Opaque>>>
  ) { }

  get type() {
    return this.#class.type
  }

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset

    const certificate_list = LengthedVector(Number24, UnlengthedList(LengthedVector(Number24, SafeOpaque))).read(cursor)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(certificate_list)
  }

  size() {
    return this.certificate_list.size()
  }

  write(cursor: Cursor) {
    this.certificate_list.write(cursor)
  }

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  handshake() {
    return new Handshake<Certificate2>(this.type, this)
  }
}