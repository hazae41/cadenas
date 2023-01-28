import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"

export class ServerHelloDone2 {
  readonly #class = ServerHelloDone2

  static type = Handshake.types.server_hello_done

  constructor() { }

  get class() {
    return this.#class
  }

  size() {
    return 0
  }

  write(binary: Binary) {
    /**
     * Nothing to write
     */
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    /**
     * Nothing to read
     */

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this()
  }
}