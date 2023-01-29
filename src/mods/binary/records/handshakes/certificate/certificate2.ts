import { Binary } from "@hazae41/binary"
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

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const certificate_list = LengthedVector(Number24, UnlengthedList(LengthedVector(Number24, SafeOpaque))).read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(certificate_list)
  }

  size() {
    return this.certificate_list.size()
  }

  write(binary: Binary) {
    this.certificate_list.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  handshake() {
    return new Handshake<Certificate2>(this.type, this)
  }
}