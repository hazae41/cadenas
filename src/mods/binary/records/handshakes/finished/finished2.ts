import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"

export class Finished2 {
  readonly #class = Finished2

  static type = Handshake.types.finished

  constructor(
    readonly verify_data: Uint8Array
  ) { }

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
  }

  size() {
    return this.verify_data.length
  }

  write(binary: Binary) {
    binary.write(this.verify_data)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  handshake() {
    return new Handshake<Finished2>(this.type, this)
  }

  static read(binary: Binary, length: number) {
    const verify_data = binary.read(length)

    return new this(verify_data)
  }
}