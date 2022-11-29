import { Binary } from "libs/binary.js"
import { Writable } from "mods/binary/writable.js"

export interface IRecord extends Writable {
  type: number
}

export class RecordHeader {
  constructor(
    readonly type: number,
    readonly version: number,
    readonly length: number
  ) { }

  size() {
    return 1 + 2 + 2
  }

  write(binary: Binary) {
    binary.writeUint8(this.type)
    binary.writeUint16(this.version)
    binary.writeUint16(this.length)
  }

  static tryRead(binary: Binary) {
    const start = binary.offset

    try {
      return this.read(binary)
    } catch (e: unknown) {
      binary.offset = start
    }
  }

  static read(binary: Binary) {
    const type = binary.readUint8()
    const version = binary.readUint16()
    const length = binary.readUint16()

    return new this(type, version, length)
  }
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
    readonly subtype: number,
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
    binary.writeUint8(this.subtype)
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