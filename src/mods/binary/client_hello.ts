import { Binary } from "libs/binary.js"
import { generateRandom } from "libs/random.js"
import { Number16, Number8, Vector } from "./vector.js"

export class ClientHello {
  readonly class = ClientHello

  constructor(
    readonly legacy_version = 0x0303,
    readonly random = generateRandom(32),
    readonly legacy_session_id = new Vector([], Number8),
    readonly cipher_suites = new Vector([new Number16(0xC02F), new Number16(0xC02F)], Number16),
    readonly legacy_compression_methods = new Vector([new Number8(0)], Number8),
    readonly extensions = new Vector([], Number16)
  ) { }

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

  export() {
    const binary = Binary.allocUnsafe(this.size())

    this.write(binary)

    return binary
  }
}