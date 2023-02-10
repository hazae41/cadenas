import { Binary } from "@hazae41/binary";
import { Writable } from "mods/binary/fragment.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class Extension<T extends Writable = Writable> {

  static readonly types = {
    elliptic_curves: 10,
    ec_point_formats: 11,
    signature_algorithms: 13
  } as const

  constructor(
    readonly subtype: number,
    readonly data: Vector<Number16, T>
  ) { }

  static from<T extends Writable>(extension_type: number, extension: T) {
    const extension_data = Vector(Number16).from(extension)

    return new this(extension_type, extension_data)
  }

  size() {
    return 2 + this.data.size()
  }

  write(cursor: Binary) {
    cursor.writeUint16(this.subtype)
    this.data.write(cursor)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }
}