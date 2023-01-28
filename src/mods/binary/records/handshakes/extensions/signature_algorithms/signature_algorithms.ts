import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/number.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";
import { SignatureAndHashAlgorithm } from "mods/binary/signature.js";
import { ArrayVector } from "mods/binary/vector.js";

export class SignatureAlgorithms {
  readonly #class = SignatureAlgorithms

  static type = Extension.types.signature_algorithms

  constructor(
    readonly supported_signature_algorithms: ArrayVector<Number16, SignatureAndHashAlgorithm>
  ) { }

  static default() {
    const { rsaWithSha256 } = SignatureAndHashAlgorithm.instances

    const supported_signature_algorithms = ArrayVector(Number16, SignatureAndHashAlgorithm).from([rsaWithSha256])

    return new this(supported_signature_algorithms)
  }

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
  }

  size() {
    return this.supported_signature_algorithms.size()
  }

  write(binary: Binary) {
    this.supported_signature_algorithms.write(binary)
  }

  static read(binary: Binary) {
    const supported_signature_algorithms = ArrayVector(Number16, SignatureAndHashAlgorithm).read(binary)

    return new this(supported_signature_algorithms)
  }

  extension() {
    return Extension.from<SignatureAlgorithms>(this.#class.type, this)
  }
}