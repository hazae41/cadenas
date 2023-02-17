import { Cursor } from "@hazae41/binary";
import { ClientDiffieHellmanPublic } from "mods/binary/records/handshakes/client_key_exchange/client_diffie_hellman_public.js";
import { Handshake } from "mods/binary/records/handshakes/handshake.js";

export class ClientKeyExchange2DH {
  readonly #class = ClientKeyExchange2DH

  static readonly type = Handshake.types.client_key_exchange

  constructor(
    readonly exchange_keys: ClientDiffieHellmanPublic
  ) { }

  static from(bytes: Uint8Array) {
    const exchange_keys = ClientDiffieHellmanPublic.from(bytes)

    return new this(exchange_keys)
  }

  size() {
    return this.exchange_keys.size()
  }

  write(cursor: Cursor) {
    this.exchange_keys.write(cursor)
  }

  handshake() {
    return new Handshake<ClientKeyExchange2DH>(this.#class.type, this)
  }

  static read(cursor: Cursor) {
    const exchange_keys = ClientDiffieHellmanPublic.read(cursor)

    return new this(exchange_keys)
  }
}