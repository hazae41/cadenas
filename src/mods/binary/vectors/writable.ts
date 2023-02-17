import { Cursor, Writable } from "@hazae41/binary";
import { NumberClass, NumberX } from "mods/binary/numbers/number.js";

export interface Vector<L extends NumberX, T extends Writable> extends Writable {
  readonly vlength: NumberClass<L>
  readonly value: T
}

export const Vector = <L extends NumberX>(vlength: NumberClass<L>) => class <T extends Writable> {

  constructor(
    readonly value: T
  ) { }

  static from<T extends Writable>(value: T) {
    return new this(value)
  }

  get vlength() {
    return vlength
  }

  size() {
    return vlength.size + this.value.size()
  }

  write(cursor: Cursor) {
    new vlength(this.value.size()).write(cursor)

    this.value.write(cursor)
  }

}