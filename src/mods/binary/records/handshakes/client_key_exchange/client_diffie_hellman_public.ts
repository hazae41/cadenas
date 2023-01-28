import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/number.js";
import { BytesVector } from "mods/binary/vector.js";

export class ClientDiffieHellmanPublicExplicit {
  constructor(
    readonly dh_Yc: BytesVector<Number16>
  ) { }

  size() {
    return this.dh_Yc.size()
  }

  write(binary: Binary) {
    this.dh_Yc.write(binary)
  }

  static read(binary: Binary) {
    const dh_Yc = BytesVector(Number16).read(binary)

    return new this(dh_Yc)
  }
}