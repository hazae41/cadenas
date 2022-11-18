import { Binary } from "libs/binary.js"
import { generateRandom } from "libs/random.js"
import { ClientSupportedVersions } from "mods/binary/extensions/supported_versions/extension.js"
import { Handshake } from "mods/binary/handshakes/handshake.js"
import { Number16, Number8, OpaqueVector, Vector, Vector16 } from "mods/binary/vector.js"

export class ClientHello {
  readonly class = ClientHello

  static type = Handshake.types.client_hello

  constructor(
    readonly legacy_version: number,
    readonly random: Buffer,
    readonly legacy_session_id: OpaqueVector<Number8>,
    readonly cipher_suites: Vector16<Number16>,
    readonly legacy_compression_methods: OpaqueVector<Number8>,
    readonly extensions: Vector<Number16>
  ) { }

  get type() {
    return this.class.type
  }

  static default3() {
    const legacy_version = 0x0303
    const random = generateRandom(32)
    const legacy_session_id = OpaqueVector.empty<Number8>(Number8)
    const cipher_suites = new Vector16<Number16>([0xC02F, 0xC02F], Number16)
    const legacy_compression_methods = new OpaqueVector<Number8>(Buffer.from([0]), Number8)
    const extensions = new Vector<Number16>([ClientSupportedVersions.default3().extension()], Number16)

    return new this(legacy_version, random, legacy_session_id, cipher_suites, legacy_compression_methods, extensions)
  }

  size() {
    return 0
      + 2
      + this.random.length
      + this.legacy_session_id.size()
      + this.cipher_suites.size()
      + this.legacy_compression_methods.size()
      + this.extensions.size()
  }

  write(binary: Binary) {
    binary.writeUint16(this.legacy_version)
    binary.write(this.random)
    this.legacy_session_id.write(binary)
    this.cipher_suites.write(binary)
    this.legacy_compression_methods.write(binary)
    this.extensions.write(binary)
  }

  handshake() {
    return new Handshake(this)
  }
}