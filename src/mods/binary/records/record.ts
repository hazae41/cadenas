import { Opaque, Writable } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Panic, Result } from "@hazae41/result"
import { CryptoError } from "libs/crypto/crypto.js"
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

export interface Recordable extends Writable {
  readonly record_type: number
}

export class PlaintextRecord<T extends Writable> {

  constructor(
    readonly type: number,
    readonly version: number,
    readonly fragment: T
  ) { }

  static from<T extends Recordable>(record: T, version: number) {
    return new PlaintextRecord(record.record_type, version, record)
  }

  sizeOrThrow() {
    return 1 + 2 + 2 + this.fragment.sizeOrThrow()
  }

  writeOrThrow(cursor: Cursor) {
    cursor.writeUint8OrThrow(this.type)
    cursor.writeUint16OrThrow(this.version)
    const size = this.fragment.sizeOrThrow()
    cursor.writeUint16OrThrow(size)
    this.fragment.writeOrThrow(cursor)
  }

  static readOrThrow(cursor: Cursor): PlaintextRecord<Opaque> {
    const type = cursor.readUint8OrThrow()
    const version = cursor.readUint16OrThrow()
    const size = cursor.readUint16OrThrow()

    const bytes = cursor.readAndCopyOrThrow(size)
    const fragment = new Opaque(bytes)

    return new PlaintextRecord<Opaque>(type, version, fragment)
  }

  async #tryEncryptBlock(encrypter: BlockEncrypter, sequence: bigint): Promise<Result<BlockCiphertextRecord, Error>> {
    const fragment = await GenericBlockCipher.tryEncrypt<T>(this, encrypter, sequence)

    return fragment.mapSync(fragment => new BlockCiphertextRecord(this.type, this.version, fragment))
  }

  async #tryEncryptAEAD(encrypter: AEADEncrypter, sequence: bigint): Promise<Result<AEADCiphertextRecord, Error>> {
    const fragment = await GenericAEADCipher.tryEncrypt<T>(this, encrypter, sequence)

    return fragment.mapSync(fragment => new AEADCiphertextRecord(this.type, this.version, fragment))
  }

  async tryEncrypt(encrypter: Encrypter, sequence: bigint): Promise<Result<BlockCiphertextRecord | AEADCiphertextRecord, Error>> {
    if (encrypter.cipher_type === "block")
      return this.#tryEncryptBlock(encrypter, sequence)
    if (encrypter.cipher_type === "aead")
      return this.#tryEncryptAEAD(encrypter, sequence)

    throw new Panic(`Invalid cipher type`)
  }

}

export class BlockCiphertextRecord {

  constructor(
    readonly type: number,
    readonly version: number,
    readonly fragment: GenericBlockCipher
  ) { }

  static tryFrom(record: PlaintextRecord<Opaque>): Result<BlockCiphertextRecord, Error> {
    const fragment = record.fragment.tryReadInto(GenericBlockCipher)

    return fragment.mapSync(fragment => new BlockCiphertextRecord(record.type, record.version, fragment))
  }

  sizeOrThrow() {
    return 1 + 2 + 2 + this.fragment.sizeOrThrow()
  }

  writeOrThrow(cursor: Cursor) {
    cursor.writeUint8OrThrow(this.type)
    cursor.writeUint16OrThrow(this.version)

    const size = this.fragment.sizeOrThrow()
    cursor.writeUint16OrThrow(size)

    this.fragment.writeOrThrow(cursor)
  }

  async tryDecrypt(encrypter: BlockEncrypter, sequence: bigint): Promise<Result<PlaintextRecord<Opaque>, CryptoError>> {
    const fragment = await this.fragment.tryDecrypt(this, encrypter, sequence)

    return fragment.mapSync(fragment => new PlaintextRecord(this.type, this.version, fragment))
  }

}

export class AEADCiphertextRecord {

  constructor(
    readonly type: number,
    readonly version: number,
    readonly fragment: GenericAEADCipher
  ) { }

  static tryFrom(record: PlaintextRecord<Opaque>): Result<AEADCiphertextRecord, Error> {
    const fragment = record.fragment.tryReadInto(GenericAEADCipher)

    return fragment.mapSync(fragment => new AEADCiphertextRecord(record.type, record.version, fragment))
  }

  sizeOrThrow() {
    return 1 + 2 + 2 + this.fragment.sizeOrThrow()
  }

  writeOrThrow(cursor: Cursor) {
    cursor.writeUint8OrThrow(this.type)
    cursor.writeUint16OrThrow(this.version)

    const size = this.fragment.sizeOrThrow()
    cursor.writeUint16OrThrow(size)

    this.fragment.writeOrThrow(cursor)
  }

  async tryDecrypt(encrypter: AEADEncrypter, sequence: bigint): Promise<Result<PlaintextRecord<Opaque>, Error>> {
    const fragment = await this.fragment.tryDecrypt(this, encrypter, sequence)

    return fragment.mapSync(fragment => new PlaintextRecord(this.type, this.version, fragment))
  }

}