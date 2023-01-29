import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Opaque, SafeOpaque } from "mods/binary/opaque.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class ClientDiffieHellmanPublicExplicit {

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

  write(binary: Binary) {
    this.dh_Yc.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    const dh_Yc = LengthedVector(Number16, SafeOpaque).read(binary)

    return new this(dh_Yc)
  }
}