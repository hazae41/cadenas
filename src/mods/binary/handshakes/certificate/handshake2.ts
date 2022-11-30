import { Binary } from "libs/binary.js"
import { Handshake } from "mods/binary/handshakes/handshake.js"
import { Number24 } from "mods/binary/number.js"
import { ArrayVector, BufferVector, Vector } from "mods/binary/vector.js"

export class Certificate2 {
  readonly class = Certificate2

  static type = Handshake.types.certificate

  constructor(
    readonly certificate_list: Vector<Number24>
  ) { }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const certificate_list = ArrayVector<Number24, BufferVector<Number24>>(Number24, BufferVector(Number24)).read(binary)

    if (binary.offset - start > length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(certificate_list)
  }
}