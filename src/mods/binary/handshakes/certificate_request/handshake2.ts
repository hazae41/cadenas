import { Binary } from "@hazae41/binary"
import { Handshake } from "mods/binary/handshakes/handshake.js"
import { Number16, Number8 } from "mods/binary/number.js"
import { SignatureAndHashAlgorithm } from "mods/binary/signature.js"
import { ArrayVector, BufferVector, Vector } from "mods/binary/vector.js"

export class ClientCertificateType {
  readonly class = ClientCertificateType

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

  size() {
    return 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.type)
  }

  static read(binary: Binary) {
    return new this(binary.readUint8())
  }
}

export class CertificateRequest2 {
  readonly class = CertificateRequest2

  static type = Handshake.types.certificate_request

  constructor(
    readonly certificate_types: ArrayVector<Number8, ClientCertificateType>,
    readonly supported_signature_algorithms: ArrayVector<Number16, SignatureAndHashAlgorithm>,
    readonly certificate_authorities: Vector<Number16>
  ) { }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const certificate_types = ArrayVector<Number8, ClientCertificateType>(Number8, ClientCertificateType).read(binary)
    const supported_signature_algorithms = ArrayVector<Number16, SignatureAndHashAlgorithm>(Number16, SignatureAndHashAlgorithm).read(binary)
    const certificate_authorities = BufferVector<Number16>(Number16).read(binary)

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(certificate_types, supported_signature_algorithms, certificate_authorities)
  }
}