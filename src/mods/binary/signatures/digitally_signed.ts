import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Opaque, SafeOpaque } from "mods/binary/opaque.js";
import { SignatureAndHashAlgorithm } from "mods/binary/signatures/signature_and_hash_algorithm.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class DigitallySigned {

  constructor(
    readonly algorithm: SignatureAndHashAlgorithm,
    readonly signature: Vector<Number16, Opaque>
  ) { }

  size() {
    return this.algorithm.size() + this.signature.size()
  }

  write(cursor: Binary) {
    this.algorithm.write(cursor)
    this.signature.write(cursor)
  }

  export() {
    const cursor = Binary.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  static read(cursor: Binary) {
    const algorithm = SignatureAndHashAlgorithm.read(cursor)
    const signature = LengthedVector(Number16, SafeOpaque).read(cursor)

    return new this(algorithm, signature)
  }
}