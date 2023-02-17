import { Cursor } from "@hazae41/binary"
import { Writable } from "mods/binary/fragment.js"
import { Opaque } from "mods/binary/opaque.js"
import { GenericAEADCipher } from "mods/binary/records/generic_ciphers/aead/aead.js"
import { GenericBlockCipher } from "mods/binary/records/generic_ciphers/block/block.js"
import { AEADEncrypter, BlockEncrypter, Encrypter } from "mods/ciphers/encryptions/encryption.js"

export namespace Record {

  export const types = {
    invalid: 0,
    change_cipher_spec: 20,
    alert: 21,
    handshake: 22,
    application_data: 23
  } as const

}

export class PlaintextRecord<T extends Writable> {
  constructor(
    readonly subtype: number,
    readonly version: number,
    readonly fragment: T
  ) { }

  size() {
    return 1 + 2 + 2 + this.fragment.size()
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.subtype)
    cursor.writeUint16(this.version)
    cursor.writeUint16(this.fragment.size())
    this.fragment.write(cursor)
  }

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Cursor) {
    const subtype = cursor.readUint8()
    const version = cursor.readUint16()
    const size = cursor.readUint16()
    const fragment = Opaque.read(cursor, size)

    return new this(subtype, version, fragment)
  }

  static tryRead(cursor: Cursor) {
    const start = cursor.offset

    try {
      return this.read(cursor)
    } catch (e: unknown) {
      cursor.offset = start
    }
  }

  async encrypt(encrypter: Encrypter, sequence: bigint) {
    if (encrypter.cipher_type === "block") {
      const gcipher = await GenericBlockCipher.encrypt<T>(this, encrypter, sequence)
      return new BlockCiphertextRecord(this.subtype, this.version, gcipher)
    }

    if (encrypter.cipher_type === "aead") {
      const gcipher = await GenericAEADCipher.encrypt<T>(this, encrypter, sequence)
      return new AEADCiphertextRecord(this.subtype, this.version, gcipher)
    }

    throw new Error(`Invalid cipher type`)
  }
}

export class BlockCiphertextRecord {
  constructor(
    readonly subtype: number,
    readonly version: number,
    readonly fragment: GenericBlockCipher
  ) { }

  static from(record: PlaintextRecord<Opaque>) {
    const cursor = new Cursor(record.fragment.bytes)
    const length = record.fragment.bytes.length

    const fragment = GenericBlockCipher.read(cursor, length)

    return new this(record.subtype, record.version, fragment)
  }

  size() {
    return 1 + 2 + 2 + this.fragment.size()
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.subtype)
    cursor.writeUint16(this.version)
    cursor.writeUint16(this.fragment.size())
    this.fragment.write(cursor)
  }

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  async decrypt(encrypter: BlockEncrypter, sequence: bigint) {
    const fragment = await this.fragment.decrypt(this, encrypter, sequence)
    return new PlaintextRecord(this.subtype, this.version, fragment)
  }
}

export class AEADCiphertextRecord {
  constructor(
    readonly subtype: number,
    readonly version: number,
    readonly fragment: GenericAEADCipher
  ) { }

  static from(record: PlaintextRecord<Opaque>) {
    const cursor = new Cursor(record.fragment.bytes)
    const length = record.fragment.bytes.length

    const fragment = GenericAEADCipher.read(cursor, length)

    return new this(record.subtype, record.version, fragment)
  }

  size() {
    return 1 + 2 + 2 + this.fragment.size()
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.subtype)
    cursor.writeUint16(this.version)
    cursor.writeUint16(this.fragment.size())
    this.fragment.write(cursor)
  }

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  async decrypt(encrypter: AEADEncrypter, sequence: bigint) {
    const fragment = await this.fragment.decrypt(this, encrypter, sequence)
    return new PlaintextRecord(this.subtype, this.version, fragment)
  }
}