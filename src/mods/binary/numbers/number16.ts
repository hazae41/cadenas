import { Binary } from "@hazae41/binary"

export class Number16 {
  readonly #class = Number16

  static size: 2 = 2

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
    binary.writeUint16(this.value)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    return new this(binary.readUint16())
  }
}