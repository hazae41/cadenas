import { Binary } from "@hazae41/binary"
import { Number8 } from "mods/binary/number.js"
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js"
import { Vector, Vector16 } from "mods/binary/vector.js"

export class ClientSupportedVersions {
  readonly #class = ClientSupportedVersions

  static type = 43

  constructor(
    readonly versions: Vector<Number8>
  ) { }

  get class() {
    return this.#class
  }

  static default3() {
    const versions = new (Vector16<Number8>(Number8))([0x0304])

    return new this(versions)
  }

  get type() {
    return this.#class.type
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