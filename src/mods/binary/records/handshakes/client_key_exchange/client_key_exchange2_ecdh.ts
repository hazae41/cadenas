import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { Handshake } from "mods/binary/records/handshakes/handshake.js";
import { ClientECDiffieHellmanPublic } from "./client_ec_diffie_hellman_public.js";

export class ClientKeyExchange2ECDH {
  readonly #class = ClientKeyExchange2ECDH

  static readonly type = Handshake.types.client_key_exchange

  constructor(
    readonly exchange_keys: ClientECDiffieHellmanPublic
  ) { }

  static new(exchange_keys: ClientECDiffieHellmanPublic) {
    return new ClientKeyExchange2ECDH(exchange_keys)
  }

  static from(bytes: Uint8Array) {
    return new ClientKeyExchange2ECDH(ClientECDiffieHellmanPublic.from(bytes))
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

  static tryRead(cursor: Cursor): Result<ClientKeyExchange2ECDH, BinaryReadError> {
    return ClientECDiffieHellmanPublic.tryRead(cursor).mapSync(ClientKeyExchange2ECDH.new)
  }

}