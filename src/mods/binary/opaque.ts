import { Binary } from "@hazae41/binary"
import { ReadableLenghted } from "mods/binary/readable.js"
import { Exportable } from "mods/binary/writable.js"

export class Opaque {
  readonly #class = Opaque

  constructor(
    readonly bytes: Uint8Array
  ) { }

  get class() {
    return this.#class
  }

  static from(fragment: Exportable) {
    return new this(fragment.export())
  }

  into<T extends ReadableLenghted<T>>(clazz: T["class"]) {
    return clazz.read(new Binary(this.bytes), this.bytes.length)
  }

  size() {
    return this.bytes.length
  }

  write(binary: Binary) {
    binary.write(this.bytes)
  }

  static read(binary: Binary, length: number) {
    const buffer = binary.read(length)

    return new this(buffer)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }
}