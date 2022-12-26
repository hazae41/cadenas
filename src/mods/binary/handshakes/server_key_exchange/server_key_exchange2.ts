import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/handshakes/handshake.js"
import { ServerKeyExchange2Anonymous } from "mods/binary/handshakes/server_key_exchange/server_key_exchange2_anonymous.js"
import { ServerKeyExchange2Ephemeral } from "mods/binary/handshakes/server_key_exchange/server_key_exchange2_ephemeral.js"
import { CipherSuite } from "mods/ciphers/cipher.js"

export function getServerKeyExchange2(cipher: CipherSuite) {
  if (cipher.anonymous)
    return ServerKeyExchange2Anonymous
  if (cipher.ephemeral)
    return ServerKeyExchange2Ephemeral
  return ServerKeyExchange2
}

export class ServerKeyExchange2 {
  readonly #class = ServerKeyExchange2

  static type = Handshake.types.server_key_exchange

  constructor() { }

  get class() {
    return this.#class
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