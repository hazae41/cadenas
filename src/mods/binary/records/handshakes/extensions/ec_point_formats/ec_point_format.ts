import { Binary } from "@hazae41/binary"

export class ECPointFormat {

  static readonly types = {
    uncompressed: 0,
    // deprecated: 1..2,
    // reserved: 248..255
  } as const

  static readonly instances = {
    uncompressed: new this(this.types.uncompressed)
  } as const

  constructor(
    readonly subtype: number
  ) { }

  size() {
    return 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.subtype)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary,) {
    const subtype = binary.readUint8()

    return new this(subtype)
  }
}
