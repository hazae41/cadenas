import { BinaryError, BinaryReadError, BinaryWriteError, Opaque, Readable, UnsafeOpaque, Writable } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Panic, Result } from "@hazae41/result"
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

export interface Recordable<T extends Writable> extends Writable.Infer<T> {
  readonly record_type: number
}

export class PlaintextRecord<T extends Writable.Infer<T>> {

  constructor(
    readonly type: number,
    readonly version: number,
    readonly fragment: T
  ) { }

  static from<T extends Recordable<T>>(record: T, version: number) {
    return new PlaintextRecord(record.record_type, version, record)
  }

  trySize(): Result<number, Writable.SizeError<T>> {
    return this.fragment.trySize().mapSync(x => 1 + 2 + 2 + x)
  }

  tryWrite(cursor: Cursor): Result<void, Writable.SizeError<T> | Writable.WriteError<T> | BinaryWriteError> {
    return Result.unthrowSync(t => {
      cursor.tryWriteUint8(this.type).throw(t)
      cursor.tryWriteUint16(this.version).throw(t)
      const size = this.fragment.trySize().throw(t)
      cursor.tryWriteUint16(size).throw(t)
      this.fragment.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<PlaintextRecord<Opaque>, BinaryReadError> {
    return Result.unthrowSync(t => {
      const type = cursor.tryReadUint8().throw(t)
      const version = cursor.tryReadUint16().throw(t)
      const size = cursor.tryReadUint16().throw(t)

      const bytes = cursor.tryRead(size).throw(t)
      const fragment = Readable.tryReadFromBytes(UnsafeOpaque, bytes).throw(t)

      return new Ok(new PlaintextRecord<Opaque>(type, version, fragment))
    })
  }

  async #tryEncryptBlock(encrypter: BlockEncrypter, sequence: bigint): Promise<Result<BlockCiphertextRecord, Writable.SizeError<T> | Writable.WriteError<T> | BinaryError>> {
    const fragment = await GenericBlockCipher.tryEncrypt<T>(this, encrypter, sequence)

    return fragment.mapSync(fragment => new BlockCiphertextRecord(this.type, this.version, fragment))
  }

  async #tryEncryptAEAD(encrypter: AEADEncrypter, sequence: bigint): Promise<Result<AEADCiphertextRecord, Writable.SizeError<T> | Writable.WriteError<T> | BinaryError>> {
    const fragment = await GenericAEADCipher.tryEncrypt<T>(this, encrypter, sequence)

    return fragment.mapSync(fragment => new AEADCiphertextRecord(this.type, this.version, fragment))
  }

  async tryEncrypt(encrypter: Encrypter, sequence: bigint): Promise<Result<BlockCiphertextRecord | AEADCiphertextRecord, Writable.SizeError<T> | Writable.WriteError<T> | BinaryError>> {
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

  static tryFrom(record: PlaintextRecord<Opaque>): Result<BlockCiphertextRecord, BinaryReadError> {
    const fragment = record.fragment.tryInto(GenericBlockCipher)

    return fragment.mapSync(fragment => new BlockCiphertextRecord(record.type, record.version, fragment))
  }

  trySize(): Result<number, never> {
    return this.fragment.trySize().mapSync(x => 1 + 2 + 2 + x)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      cursor.tryWriteUint8(this.type).throw(t)
      cursor.tryWriteUint16(this.version).throw(t)

      const size = this.fragment.trySize().throw(t)
      cursor.tryWriteUint16(size).throw(t)

      this.fragment.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  async tryDecrypt(encrypter: BlockEncrypter, sequence: bigint): Promise<Result<PlaintextRecord<Opaque>, never>> {
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

  static tryFrom(record: PlaintextRecord<Opaque>): Result<AEADCiphertextRecord, BinaryReadError> {
    const fragment = record.fragment.tryInto(GenericAEADCipher)

    return fragment.mapSync(fragment => new AEADCiphertextRecord(record.type, record.version, fragment))
  }

  trySize(): Result<number, never> {
    return this.fragment.trySize().mapSync(x => 1 + 2 + 2 + x)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      cursor.tryWriteUint8(this.type).throw(t)
      cursor.tryWriteUint16(this.version).throw(t)

      const size = this.fragment.trySize().throw(t)
      cursor.tryWriteUint16(size).throw(t)

      this.fragment.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  async tryDecrypt(encrypter: AEADEncrypter, sequence: bigint): Promise<Result<PlaintextRecord<Opaque>, BinaryWriteError>> {
    const fragment = await this.fragment.tryDecrypt(this, encrypter, sequence)

    return fragment.mapSync(fragment => new PlaintextRecord(this.type, this.version, fragment))
  }

}