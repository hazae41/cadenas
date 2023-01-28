import { Binary } from "@hazae41/binary";
import { Array } from "mods/binary/arrays/array.js";
import { UnlengthedArray } from "mods/binary/arrays/unlengthed.js";
import { WritableArray } from "mods/binary/arrays/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";
import { SignatureAndHashAlgorithm } from "mods/binary/signature.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/vector.js";
import { WritableVector } from "mods/binary/vectors/writable.js";

export class SignatureAlgorithms {
  readonly #class = SignatureAlgorithms

  static readonly type = Extension.types.signature_algorithms

  constructor(
    readonly supported_signature_algorithms: Vector<Number16, Array<SignatureAndHashAlgorithm>>
  ) { }

  static default() {
    const { rsaWithSha256 } = SignatureAndHashAlgorithm.instances

    const supported_signature_algorithms = WritableVector(Number16).from(WritableArray().from([rsaWithSha256]))

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

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  extension() {
    return Extension.from<SignatureAlgorithms>(this.#class.type, this)
  }

  static read(binary: Binary) {
    const supported_signature_algorithms = LengthedVector(Number16, UnlengthedArray(SignatureAndHashAlgorithm)).read(binary)

    return new this(supported_signature_algorithms)
  }
}