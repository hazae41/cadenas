import { Binary } from "libs/binary.js"

export class Opaque {
  readonly class = Opaque

  constructor(
    readonly buffer: Buffer
  ) { }

  size() {
    return this.buffer.length
  }

  write(binary: Binary) {
    binary.write(this.buffer)
  }
}