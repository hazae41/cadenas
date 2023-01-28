import { Binary } from "@hazae41/binary"
import { Array } from "mods/binary/arrays/array.js"
import { UnlengthedArray } from "mods/binary/arrays/unlengthed.js"
import { Number16 } from "mods/binary/numbers/number16.js"
import { Number8 } from "mods/binary/numbers/number8.js"
import { Opaque } from "mods/binary/opaque.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { SignatureAndHashAlgorithm } from "mods/binary/signature.js"
import { LengthedVector } from "mods/binary/vectors/lengthed.js"
import { Vector } from "mods/binary/vectors/vector.js"

export class ClientCertificateType {
  readonly #class = ClientCertificateType

  static types = {
    rsa_sign: 1,
    dss_sign: 2,
    rsa_fixed_dh: 3,
    dss_fixed_dh: 4,
    rsa_ephemeral_dh_RESERVED: 5,
    dss_ephemeral_dh_RESERVED: 6,
    fortezza_dms_RESERVED: 20
  }

  constructor(
    readonly type: number
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.type)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    return new this(binary.readUint8())
  }
}

export class CertificateRequest2 {
  readonly #class = CertificateRequest2

  static type = Handshake.types.certificate_request

  constructor(
    readonly certificate_types: Vector<Number8, Array<ClientCertificateType>>,
    readonly supported_signature_algorithms: Vector<Number16, Array<SignatureAndHashAlgorithm>>,
    readonly certificate_authorities: Vector<Number16, Opaque>
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return 0
      + this.certificate_types.size()
      + this.supported_signature_algorithms.size()
      + this.certificate_authorities.size()
  }

  write(binary: Binary) {
    this.certificate_types.write(binary)
    this.supported_signature_algorithms.write(binary)
    this.certificate_authorities.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const certificate_types = LengthedVector(Number8, UnlengthedArray(ClientCertificateType)).read(binary)
    const supported_signature_algorithms = LengthedVector(Number16, UnlengthedArray(SignatureAndHashAlgorithm)).read(binary)
    const certificate_authorities = LengthedVector(Number16, Opaque).read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(certificate_types, supported_signature_algorithms, certificate_authorities)
  }
}