import { Writable } from "mods/binary/fragment.js";
import { NumberClass, NumberX } from "mods/binary/number.js";

export interface Vector<L extends NumberX, T extends Writable> extends Writable {
  readonly vlength: NumberClass<L>
  readonly value: T
}