import { Cursor } from "@hazae41/binary";

export class HashAlgorithm {

  static readonly types = {
    none: 0,
    md5: 1,
    sha1: 2,
    sha224: 3,
    sha256: 4,
    sha384: 5,
    sha512: 6,
  } as const

  static readonly instances = {
    none: new this(this.types.none),
    md5: new this(this.types.md5),
    sha1: new this(this.types.sha1),
    sha224: new this(this.types.sha224),
    sha256: new this(this.types.sha256),
    sha384: new this(this.types.sha384),
    sha512: new this(this.types.sha512)
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