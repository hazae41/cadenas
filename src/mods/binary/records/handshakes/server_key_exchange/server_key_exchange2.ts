import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ServerKeyExchange2Anonymous } from "mods/binary/records/handshakes/server_key_exchange/server_key_exchange2_anonymous.js"
import { ServerKeyExchange2Ephemeral } from "mods/binary/records/handshakes/server_key_exchange/server_key_exchange2_ephemeral.js"
import { Cipher } from "mods/ciphers/cipher.js"

export type ServerKeyExchange2 =
  | ServerKeyExchange2Anonymous
  | ServerKeyExchange2Ephemeral
  | ServerKeyExchange2None

export function getServerKeyExchange2(cipher: Cipher) {
  if (cipher.key_exchange.anonymous)
    return ServerKeyExchange2Anonymous
  if (cipher.key_exchange.ephemeral)
    return ServerKeyExchange2Ephemeral
  return ServerKeyExchange2None
}

export class ServerKeyExchange2None {
  readonly #class = ServerKeyExchange2None

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