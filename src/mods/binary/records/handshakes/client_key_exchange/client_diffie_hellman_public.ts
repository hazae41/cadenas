import { Cursor } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Opaque, SafeOpaque } from "mods/binary/opaque.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
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

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Cursor) {
    const dh_Yc = LengthedVector(Number16, SafeOpaque).read(cursor)

    return new this(dh_Yc)
  }
}