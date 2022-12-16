import { Binary } from "@hazae41/binary"

export type NumberX =
  | Number8
  | Number16
  | Number24

export class Number8 {
  readonly #class = Number8

  static size: 1 = 1

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

  static read(binary: Binary) {
    return new this(binary.readUint8())
  }
}

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

  static read(binary: Binary) {
    return new this(binary.readUint16())
  }
}

export class Number24 {
  readonly #class = Number24

  static size: 3 = 3

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

  static read(binary: Binary) {
    return new this(binary.readUint24())
  }
}