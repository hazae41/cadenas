import { Binary } from "@hazae41/binary"
import { Lengthed, LengthedClass, Writable } from "mods/binary/fragment.js"

export class Opaque {
  readonly #class = Opaque

  constructor(
    readonly bytes: Uint8Array
  ) { }

  get class() {
    return this.#class
  }

  static from(fragment: Writable) {
    return new this(fragment.export())
  }

  into<T extends Lengthed<T>>(clazz: LengthedClass<T>) {
    return clazz.read(new Binary(this.bytes), this.bytes.length)
  }

  size() {
    return this.bytes.length
  }

  write(binary: Binary) {
    binary.write(this.bytes)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary, length: number) {
    const buffer = binary.read(length)

    return new this(buffer)
  }
}