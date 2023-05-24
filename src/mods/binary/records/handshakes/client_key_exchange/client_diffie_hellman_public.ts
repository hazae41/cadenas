import { BinaryReadError, BinaryWriteError, Opaque, SafeOpaque } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { Number16 } from "mods/binary/numbers/number16.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class ClientDiffieHellmanPublic {

  constructor(
    readonly dh_Yc: Vector<Number16, Opaque>
  ) { }

  static new(dh_Yc: Vector<Number16, Opaque>) {
    return new ClientDiffieHellmanPublic(dh_Yc)
  }

  static from(bytes: Uint8Array) {
    const dh_Yc = Vector(Number16).from(new Opaque(bytes))

    return new this(dh_Yc)
  }

  trySize(): Result<number, never> {
    return this.dh_Yc.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.dh_Yc.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<ClientDiffieHellmanPublic, BinaryReadError> {
    return ReadableVector(Number16, SafeOpaque).tryRead(cursor).mapSync(ClientDiffieHellmanPublic.new)
  }

}