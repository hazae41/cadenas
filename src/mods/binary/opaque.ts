import { Binary } from "@hazae41/binary"

export class Opaque {
  readonly #class = Opaque

  constructor(
    readonly buffer: Buffer
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return this.buffer.length
  }

  write(binary: Binary) {
    binary.write(this.buffer)
  }

  static read(binary: Binary, length: number) {
    const buffer = binary.read(length)

    return new this(buffer)
  }
}