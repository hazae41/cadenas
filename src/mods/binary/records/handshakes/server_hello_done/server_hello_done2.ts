import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"

export class ServerHelloDone2 {

  static readonly type = Handshake.types.server_hello_done

  constructor() { }

  size() {
    return 0
  }

  write(binary: Binary) {
    /**
     * NOOP
     */
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    /**
     * NOOP
     */

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this()
  }
}