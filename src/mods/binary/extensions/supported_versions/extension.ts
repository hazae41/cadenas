import { Binary } from "libs/binary.js"
import { Number8, Vector16 } from "mods/binary/vector.js"
import { Extension } from "../extension.js"

export class ClientSupportedVersions {
  readonly class = ClientSupportedVersions

  static type = 43

  constructor(
    readonly versions: Vector16<Number8>
  ) { }

  static default3() {
    const versions = new Vector16<Number8>([0x0304], Number8)

    return new this(versions)
  }

  get type() {
    return this.class.type
  }

  size() {
    return this.versions.size()
  }

  write(binary: Binary) {
    this.versions.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())

    this.write(binary)

    return binary
  }

  extension() {
    return Extension.from(this)
  }
}