import { Binary } from "libs/binary.js"
import { Handshake } from "mods/binary/handshakes/handshake.js"

export class ServerHelloDone2 {
  readonly class = ServerHelloDone2

  static type = Handshake.types.server_hello_done

  constructor() { }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    /**
     * Nothing to read
     */

    if (binary.offset - start > length)
      throw new Error(`Invalid ${this.name} length`)

    return new this()
  }
}