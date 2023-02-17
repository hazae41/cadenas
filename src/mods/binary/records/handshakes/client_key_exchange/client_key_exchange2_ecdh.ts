import { Cursor } from "@hazae41/binary";
import { Handshake } from "mods/binary/records/handshakes/handshake.js";
import { ClientECDiffieHellmanPublic } from "./client_ec_diffie_hellman_public.js";

export class ClientKeyExchange2ECDH {
  readonly #class = ClientKeyExchange2ECDH

  static readonly type = Handshake.types.client_key_exchange

  constructor(
    readonly exchange_keys: ClientECDiffieHellmanPublic
  ) { }

  static from(bytes: Uint8Array) {
    const exchange_keys = ClientECDiffieHellmanPublic.from(bytes)

    return new this(exchange_keys)
  }

  size() {
    return this.exchange_keys.size()
  }

  write(cursor: Cursor) {
    this.exchange_keys.write(cursor)
  }

  handshake() {
    return new Handshake(this.#class.type, this)
  }

  static read(cursor: Cursor) {
    const exchange_keys = ClientECDiffieHellmanPublic.read(cursor)

    return new this(exchange_keys)
  }
}