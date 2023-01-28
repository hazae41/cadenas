import { Binary } from "@hazae41/binary";

export class NamedCurve {
  readonly #class = NamedCurve

  static readonly types = {
    secp256r1: 23,
    secp384r1: 24,
    secp521r1: 25,
    x25519: 29,
    x448: 30,
  } as const

  static readonly instances = {
    secp256r1: new this(23),
    secp384r1: new this(24),
    secp521r1: new this(25),
    x25519: new this(29),
    x448: new this(30),
  }

  constructor(
    readonly subtype: number
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return 2
  }

  write(binary: Binary) {
    binary.writeUint16(this.subtype)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary,) {
    const subtype = binary.readUint16()

    return new this(subtype)
  }
}
