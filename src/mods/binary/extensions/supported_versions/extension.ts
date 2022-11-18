import { Binary } from "libs/binary.js"

export class ClientSupportedVersions {

  constructor(
    readonly versions: number[]
  ) { }

  get blength() {
    return (1 + (this.versions.length * 2))
  }

  write() {
    const binary = Binary.allocUnsafe(this.blength)

    binary.writeUint8(this.versions.length)

    for (const version of this.versions)
      binary.writeUint16(version)

    return binary.buffer
  }
}