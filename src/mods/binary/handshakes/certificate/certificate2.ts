import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/handshakes/handshake.js"
import { Number24 } from "mods/binary/number.js"
import { ArrayVector, BytesVector } from "mods/binary/vector.js"

export class Certificate2 {
  readonly #class = Certificate2

  static type = Handshake.types.certificate

  constructor(
    readonly certificate_list: ArrayVector<Number24, BytesVector<Number24>>
  ) { }

  get class() {
    return this.#class
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const certificate_list = ArrayVector<Number24, BytesVector<Number24>>(Number24, BytesVector(Number24)).read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(certificate_list)
  }
}