import { Cursor, Opaque, SafeOpaque } from "@hazae41/binary"
import { ReadableList } from "mods/binary/lists/readable.js"
import { List } from "mods/binary/lists/writable.js"
import { Number24 } from "mods/binary/numbers/number24.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ReadableVector } from "mods/binary/vectors/readable.js"
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

  static read(cursor: Cursor) {
    const certificate_list = ReadableVector(Number24, ReadableList(ReadableVector(Number24, SafeOpaque))).read(cursor)

    return new this(certificate_list)
  }

  size() {
    return this.certificate_list.size()
  }

  write(cursor: Cursor) {
    this.certificate_list.write(cursor)
  }

  handshake() {
    return new Handshake<Certificate2>(this.type, this)
  }
}