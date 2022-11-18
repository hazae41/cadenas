import { Binary } from "libs/binary.js"

export class Extension {
  readonly class = Extension

  constructor(
    readonly type: number,
    readonly data: Buffer
  ) { }

  get blength() {
    return 2 + (2 + this.data.length)
  }

  write() {
    const binary = Binary.allocUnsafe(this.blength)

    binary.writeUint16(this.type)
    binary.writeUint16(this.data.length)
    binary.write(this.data)

    return binary.buffer
  }


}