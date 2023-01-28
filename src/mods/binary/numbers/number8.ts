import { Binary } from "@hazae41/binary"

export class Number8 {
  readonly #class = Number8

  static readonly size = 1 as const

  constructor(
    readonly value: number
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return this.#class.size
  }

  write(binary: Binary) {
    binary.writeUint8(this.value)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    return new this(binary.readUint8())
  }
}