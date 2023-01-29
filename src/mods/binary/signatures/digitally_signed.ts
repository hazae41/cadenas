import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Opaque, SafeOpaque } from "mods/binary/opaque.js";
import { SignatureAndHashAlgorithm } from "mods/binary/signatures/signature_and_hash_algorithm.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class DigitallySigned {
  readonly #class = DigitallySigned

  constructor(
    readonly algorithm: SignatureAndHashAlgorithm,
    readonly signature: Vector<Number16, Opaque>
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return this.algorithm.size() + this.signature.size()
  }

  write(binary: Binary) {
    this.algorithm.write(binary)
    this.signature.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    const algorithm = SignatureAndHashAlgorithm.read(binary)
    const signature = LengthedVector(Number16, SafeOpaque).read(binary)

    return new this(algorithm, signature)
  }
}