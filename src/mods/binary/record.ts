import { Binary } from "libs/binary.js"
import { Writable } from "mods/binary/writable.js"

export interface IRecord extends Writable {
  type: number
}

export class Record {
  readonly class = Record

  static types = {
    invalid: 0,
    change_cipher_spec: 20,
    alert: 21,
    handshake: 22,
    application_data: 23
  }

  constructor(
    readonly type: number,
    readonly version: number,
    readonly fragment: Writable
  ) { }

  static from(record: IRecord, version: number) {
    return new this(record.type, version, record)
  }

  size() {
    return 1 + 2 + 2 + this.fragment.size()
  }

  write(binary: Binary) {
    binary.writeUint8(this.type)
    binary.writeUint16(this.version)
    binary.writeUint16(this.fragment.size())
    this.fragment.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())

    this.write(binary)

    return binary
  }
}