import { Binary } from "@hazae41/binary";
import { UnlengthedClass, Writable } from "mods/binary/fragment.js";
import { NumberClass, NumberX } from "mods/binary/numbers/number.js";
import { Vector } from "mods/binary/vectors/writable.js";

export const UnlengthedVector = <L extends NumberX, T extends Writable>(vlength: NumberClass<L>, clazz: UnlengthedClass<T>) => class {

  static read(binary: Binary) {
    const length = vlength.read(binary).value
    const start = binary.offset

    const value = clazz.read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid vector length`)

    return new (Vector(vlength))(value)
  }

}