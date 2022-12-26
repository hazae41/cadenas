import { Binary } from "@hazae41/binary";
import { ClientDiffieHellmanPublicExplicit } from "mods/binary/handshakes/client_key_exchange/client_diffie_hellman_public.js";
import { Handshake } from "mods/binary/handshakes/handshake.js";

export class ClientKeyExchange2DH {
  readonly #class = ClientKeyExchange2DH

  static type = Handshake.types.client_key_exchange

  constructor(
    readonly exchange_keys: ClientDiffieHellmanPublicExplicit
  ) { }

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
  }

  size() {
    return this.exchange_keys.size()
  }

  write(binary: Binary) {
    this.exchange_keys.write(binary)
  }

  handshake() {
    return Handshake.from(this)
  }
}