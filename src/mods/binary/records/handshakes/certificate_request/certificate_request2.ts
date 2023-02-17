import { Cursor } from "@hazae41/binary"
import { UnlengthedList } from "mods/binary/lists/unlengthed.js"
import { List } from "mods/binary/lists/writable.js"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Number8 } from "mods/binary/numbers/number8.js"
import { Opaque, SafeOpaque } from "mods/binary/opaque.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { SignatureAndHashAlgorithm } from "mods/binary/signatures/signature_and_hash_algorithm.js"
import { LengthedVector } from "mods/binary/vectors/lengthed.js"
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

  size() {
    return 1
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.type)
  }

  static read(cursor: Cursor) {
    return new this(cursor.readUint8())
  }
}

export class CertificateRequest2 {

  static readonly type = Handshake.types.certificate_request

  constructor(
    readonly certificate_types: Vector<Number8, List<ClientCertificateType>>,
    readonly supported_signature_algorithms: Vector<Number16, List<SignatureAndHashAlgorithm>>,
    readonly certificate_authorities: Vector<Number16, Opaque>
  ) { }

  size() {
    return 0
      + this.certificate_types.size()
      + this.supported_signature_algorithms.size()
      + this.certificate_authorities.size()
  }

  write(cursor: Cursor) {
    this.certificate_types.write(cursor)
    this.supported_signature_algorithms.write(cursor)
    this.certificate_authorities.write(cursor)
  }

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset

    const certificate_types = LengthedVector(Number8, UnlengthedList(ClientCertificateType)).read(cursor)
    const supported_signature_algorithms = LengthedVector(Number16, UnlengthedList(SignatureAndHashAlgorithm)).read(cursor)
    const certificate_authorities = LengthedVector(Number16, SafeOpaque).read(cursor)

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(certificate_types, supported_signature_algorithms, certificate_authorities)
  }
}