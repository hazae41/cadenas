import { Binary } from "@hazae41/binary"
import { Bytes } from "libs/bytes/bytes.js"

export class Random {
  readonly #class = Random

  constructor(
    readonly gmt_unix_time: number,
    readonly random_bytes: Uint8Array
  ) { }

  static default() {
    const gmt_unix_time = ~~(Date.now() / 1000)
    const random_bytes = Bytes.random(28)

    return new this(gmt_unix_time, random_bytes)
  }

  get class() {
    return this.#class
  }

  size() {
    return 4 + this.random_bytes.length
  }

  write(binary: Binary) {
    binary.writeUint32(this.gmt_unix_time)
    binary.write(this.random_bytes)
  }

  static read(binary: Binary) {
    const gmt_unix_time = binary.readUint32()
    const random_bytes = binary.read(28)

    return new this(gmt_unix_time, random_bytes)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())

    this.write(binary)

    return binary
  }
}