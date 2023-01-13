import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/number.js";
import { Vector } from "mods/binary/vector.js";

export class ClientDiffieHellmanPublicExplicit {
  constructor(
    readonly dh_Yc: Vector<Number16>
  ) { }

  size() {
    return this.dh_Yc.size()
  }

  write(binary: Binary) {
    this.dh_Yc.write(binary)
  }
}