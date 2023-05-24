import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { ClientDiffieHellmanPublic } from "mods/binary/records/handshakes/client_key_exchange/client_diffie_hellman_public.js";
import { Handshake } from "mods/binary/records/handshakes/handshake.js";

export class ClientKeyExchange2DH {
  readonly #class = ClientKeyExchange2DH

  static readonly type = Handshake.types.client_key_exchange

  constructor(
    readonly exchange_keys: ClientDiffieHellmanPublic
  ) { }

  static new(exchange_keys: ClientDiffieHellmanPublic) {
    return new ClientKeyExchange2DH(exchange_keys)
  }

  static from(bytes: Uint8Array) {
    return new ClientKeyExchange2DH(ClientDiffieHellmanPublic.from(bytes))
  }

  get type() {
    return this.#class.type
  }

  trySize(): Result<number, never> {
    return this.exchange_keys.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.exchange_keys.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<ClientKeyExchange2DH, BinaryReadError> {
    return ClientDiffieHellmanPublic.tryRead(cursor).mapSync(ClientKeyExchange2DH.new)
  }

}