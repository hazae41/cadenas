import { Binary } from "@hazae41/binary"

export class Number24 {
  readonly #class = Number24

  static readonly size = 3 as const

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
    binary.writeUint24(this.value)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    return new this(binary.readUint24())
  }
}