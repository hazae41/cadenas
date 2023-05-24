import { BinaryReadError, BinaryWriteError, Opaque, SafeOpaque } from "@hazae41/binary"
import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { ReadableList } from "mods/binary/lists/readable.js"
import { List } from "mods/binary/lists/writable.js"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Number8 } from "mods/binary/numbers/number8.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { SignatureAndHashAlgorithm } from "mods/binary/signatures/signature_and_hash_algorithm.js"
import { ReadableVector } from "mods/binary/vectors/readable.js"
import { Vector } from "mods/binary/vectors/writable.js"

export class ClientCertificateType {

  static readonly types = {
    rsa_sign: 1,
    dss_sign: 2,
    rsa_fixed_dh: 3,
    dss_fixed_dh: 4,
    rsa_ephemeral_dh_RESERVED: 5,
    dss_ephemeral_dh_RESERVED: 6,
    fortezza_dms_RESERVED: 20
  } as const

  constructor(
    readonly type: number
  ) { }

  static new(type: number) {
    return new ClientCertificateType(type)
  }

  trySize(): Result<number, never> {
    return new Ok(1)
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return cursor.tryWriteUint8(this.type)
  }

  static tryRead(cursor: Cursor): Result<ClientCertificateType, BinaryReadError> {
    return cursor.tryReadUint8().mapSync(ClientCertificateType.new)
  }

}

export class CertificateRequest2 {

  static readonly type = Handshake.types.certificate_request

  constructor(
    readonly certificate_types: Vector<Number8, List<ClientCertificateType>>,
    readonly supported_signature_algorithms: Vector<Number16, List<SignatureAndHashAlgorithm>>,
    readonly certificate_authorities: Vector<Number16, Opaque>
  ) { }

  trySize(): Result<number, never> {
    return new Ok(0
      + this.certificate_types.trySize().get()
      + this.supported_signature_algorithms.trySize().get()
      + this.certificate_authorities.trySize().get())
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      this.certificate_types.tryWrite(cursor).throw(t)
      this.supported_signature_algorithms.tryWrite(cursor).throw(t)
      this.certificate_authorities.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<CertificateRequest2, BinaryReadError> {
    return Result.unthrowSync(t => {
      const certificate_types = ReadableVector(Number8, ReadableList(ClientCertificateType)).tryRead(cursor).throw(t)
      const supported_signature_algorithms = ReadableVector(Number16, ReadableList(SignatureAndHashAlgorithm)).tryRead(cursor).throw(t)
      const certificate_authorities = ReadableVector(Number16, SafeOpaque).tryRead(cursor).throw(t)

      return new Ok(new CertificateRequest2(certificate_types, supported_signature_algorithms, certificate_authorities))
    })
  }
}