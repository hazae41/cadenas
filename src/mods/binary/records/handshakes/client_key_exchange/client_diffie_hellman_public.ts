import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/number.js";
import { Opaque } from "mods/binary/opaque.js";
import { IWritableVector, LengthedVector } from "mods/binary/vector.js";

export class ClientDiffieHellmanPublicExplicit {
  constructor(
    readonly dh_Yc: IWritableVector<Number16, Opaque>
  ) { }

  size() {
    return this.dh_Yc.size()
  }

  write(binary: Binary) {
    this.dh_Yc.write(binary)
  }

  static read(binary: Binary) {
    const dh_Yc = LengthedVector(Number16, Opaque).read(binary)

    return new this(dh_Yc)
  }
}