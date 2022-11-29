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

    const certificate_list = ArrayVector.read(binary, Number24, BufferVector(Number24))

    if (binary.offset - start > length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(certificate_list)
  }
}