import { Binary } from "@hazae41/binary";
import { ClientDiffieHellmanPublicExplicit } from "mods/binary/records/handshakes/client_key_exchange/client_diffie_hellman_public.js";
import { Handshake } from "mods/binary/records/handshakes/handshake.js";

export class ClientKeyExchange2DH {
  readonly #class = ClientKeyExchange2DH

  static readonly type = Handshake.types.client_key_exchange

  constructor(
    readonly exchange_keys: ClientDiffieHellmanPublicExplicit
  ) { }

  static from(bytes: Uint8Array) {
    const exchange_keys = ClientDiffieHellmanPublicExplicit.from(bytes)

    return new this(exchange_keys)
  }

  size() {
    return this.exchange_keys.size()
  }

  write(binary: Binary) {
    this.exchange_keys.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  handshake() {
    return new Handshake<ClientKeyExchange2DH>(this.#class.type, this)
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const exchange_keys = ClientDiffieHellmanPublicExplicit.read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(exchange_keys)
  }
}