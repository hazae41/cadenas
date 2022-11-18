import { Binary } from "libs/binary.js"
import { Number16, OpaqueVector } from "mods/binary/vector.js"

export interface IExtension {
  type: number
  export(): Binary
}

export class Extension {
  readonly class = Extension

  constructor(
    readonly type: number,
    readonly data: OpaqueVector<Number16>
  ) { }

  static from(extension: IExtension) {
    const buffer = extension.export().buffer
    const data = new OpaqueVector(buffer, Number16)

    return new this(extension.type, data)
  }

  size() {
    return 2 + this.data.size()
  }

  write(binary: Binary) {
    binary.writeUint16(this.type)
    this.data.write(binary)
  }
}