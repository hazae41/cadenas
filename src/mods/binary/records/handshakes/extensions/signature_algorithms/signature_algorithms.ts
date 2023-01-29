import { Binary } from "@hazae41/binary";
import { UnlengthedList } from "mods/binary/lists/unlengthed.js";
import { List } from "mods/binary/lists/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";
import { SignatureAndHashAlgorithm } from "mods/binary/signatures/signature_and_hash_algorithm.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class SignatureAlgorithms {
  readonly #class = SignatureAlgorithms

  static readonly type = Extension.types.signature_algorithms

  constructor(
    readonly supported_signature_algorithms: Vector<Number16, List<SignatureAndHashAlgorithm>>
  ) { }

  static default() {
    const { rsaWithSha256 } = SignatureAndHashAlgorithm.instances

    const supported_signature_algorithms = Vector(Number16).from(List.from([rsaWithSha256]))

    return new this(supported_signature_algorithms)
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
    return Extension.from(this.#class.type, this)
  }

  static read(binary: Binary) {
    const supported_signature_algorithms = LengthedVector(Number16, UnlengthedList(SignatureAndHashAlgorithm)).read(binary)

    return new this(supported_signature_algorithms)
  }
}