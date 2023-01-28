import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Opaque } from "mods/binary/opaque.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/vector.js";

export class ClientDiffieHellmanPublicExplicit {
  constructor(
    readonly dh_Yc: Vector<Number16, Opaque>
  ) { }

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
    const dh_Yc = LengthedVector(Number16, Opaque).read(binary)

    return new this(dh_Yc)
  }
}