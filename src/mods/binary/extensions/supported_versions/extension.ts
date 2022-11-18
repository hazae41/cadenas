import { Binary } from "libs/binary.js"
import { Extension } from "mods/binary/extensions/extension.js"
import { Number8 } from "mods/binary/number.js"
import { Vector, Vector16 } from "mods/binary/vector.js"

export class ClientSupportedVersions {
  readonly class = ClientSupportedVersions

  static type = 43

  constructor(
    readonly versions: Vector<Number8>
  ) { }

  static default3() {
    const versions = new Vector16<Number8>([0x0303, 0x0304], Number8)

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

  extension() {
    return Extension.from(this)
  }
}