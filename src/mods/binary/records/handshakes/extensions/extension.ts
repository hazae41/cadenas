import { Binary } from "@hazae41/binary"
import { Number16 } from "mods/binary/number.js"
import { Opaque } from "mods/binary/opaque.js"
import { LengthedVector, Vector, WritableVector } from "mods/binary/vector.js"
import { Writable } from "mods/binary/writable.js"

export class Extension<T extends Writable = Writable> {
  readonly #class = Extension

  static types = {
    elliptic_curves: 10,
    ec_point_formats: 11,
    signature_algorithms: 13
  } as const

  constructor(
    readonly extension_type: number,
    readonly extension_data: Vector<Number16, T>
  ) { }

  static from<T extends Writable>(extension_type: number, extension: T) {
    const extension_data = WritableVector(Number16).from(extension)

    return new this(extension_type, extension_data)
  }

  get class() {
    return this.#class
  }

  size() {
    return 2 + this.extension_data.size()
  }

  write(binary: Binary) {
    binary.writeUint16(this.extension_type)
    this.extension_data.write(binary)
  }

  static read(binary: Binary) {
    const extension_type = binary.readUint16()
    const extension_data = LengthedVector(Number16, Opaque).read(binary)

    return new this(extension_type, extension_data)
  }
}