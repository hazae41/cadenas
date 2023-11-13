import { Cursor } from "@hazae41/cursor"

export class SignatureAlgorithm {

  static readonly types = {
    anonymous: 0,
    rsa: 1,
    dsa: 2,
    ecdsa: 3
  } as const

  static readonly instances = {
    anonymous: new SignatureAlgorithm(SignatureAlgorithm.types.anonymous),
    rsa: new SignatureAlgorithm(SignatureAlgorithm.types.rsa),
    dsa: new SignatureAlgorithm(SignatureAlgorithm.types.dsa),
    ecdsa: new SignatureAlgorithm(SignatureAlgorithm.types.ecdsa)
  } as const

  constructor(
    readonly type: number
  ) { }

  static new(type: number) {
    return new SignatureAlgorithm(type)
  }

  sizeOrThrow() {
    return 1
  }

  writeOrThrow(cursor: Cursor) {
    return cursor.writeUint8OrThrow(this.type)
  }

  static readOrThrow(cursor: Cursor) {
    return new SignatureAlgorithm(cursor.readUint8OrThrow())
  }

}