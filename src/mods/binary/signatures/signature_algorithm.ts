import { Binary } from "@hazae41/binary";

export class SignatureAlgorithm {
  readonly #class = SignatureAlgorithm

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

  get class() {
    return this.#class
  }

  size() {
    return 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.type)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    return new this(binary.readUint8())
  }
}