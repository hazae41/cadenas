import { Cursor, Opaque, SafeOpaque } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class ClientDiffieHellmanPublic {

  constructor(
    readonly dh_Yc: Vector<Number16, Opaque>
  ) { }

  static from(bytes: Uint8Array) {
    const dh_Yc = Vector(Number16).from(new Opaque(bytes))

    return new this(dh_Yc)
  }

  size() {
    return this.dh_Yc.size()
  }

  write(cursor: Cursor) {
    this.dh_Yc.write(cursor)
  }

  static read(cursor: Cursor) {
    const dh_Yc = ReadableVector(Number16, SafeOpaque).read(cursor)

    return new this(dh_Yc)
  }
}