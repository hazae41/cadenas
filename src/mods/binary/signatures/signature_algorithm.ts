import { Cursor } from "@hazae41/binary";

export class SignatureAlgorithm {

  static readonly types = {
    anonymous: 0,
    rsa: 1,
    dsa: 2,
    ecdsa: 3
  } as const

  static readonly instances = {
    anonymous: new this(this.types.anonymous),
    rsa: new this(this.types.rsa),
    dsa: new this(this.types.dsa),
    ecdsa: new this(this.types.ecdsa)
  } as const

  constructor(
    readonly type: number
  ) { }

  size() {
    return 1
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.type)
  }

  static read(cursor: Cursor) {
    return new this(cursor.readUint8())
  }
}