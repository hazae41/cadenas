import { Cursor } from "@hazae41/binary"

export class ECCurveType {

  static readonly types = {
    // deprecated: 1..2,
    named_curve: 3,
    // reserved: 248..255
  } as const

  static readonly instances = {
    named_curve: new this(this.types.named_curve)
  } as const

  constructor(
    readonly subtype: number
  ) { }

  size() {
    return 1
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.subtype)
  }

  static read(cursor: Cursor) {
    const subtype = cursor.readUint8()

    return new this(subtype)
  }
}