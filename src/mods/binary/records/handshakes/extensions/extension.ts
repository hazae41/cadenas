import { Binary } from "@hazae41/binary"
import { Number16 } from "mods/binary/number.js"
import { AnyVector, Vector } from "mods/binary/vector.js"
import { Writable } from "mods/binary/writable.js"


export class Extension {
  readonly #class = Extension

  static types = {
    signature_algorithms: 13
  } as const

  constructor(
    readonly extension_type: number,
    readonly extension_data: Vector<Number16>
  ) { }

  static from(type: number, extension: Writable) {
    const data = AnyVector<Number16, Writable>(Number16).from(extension)

    return new this(type, data)
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

  static read(binary: Binary): Extension {
    throw new Error(`Unimplemented`)
  }
}