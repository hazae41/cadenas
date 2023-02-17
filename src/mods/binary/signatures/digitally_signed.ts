import { Cursor, Opaque, SafeOpaque } from "@hazae41/binary";
import { Number16 } from "mods/binary/numbers/number16.js";
import { SignatureAndHashAlgorithm } from "mods/binary/signatures/signature_and_hash_algorithm.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";

export class DigitallySigned {

  constructor(
    readonly algorithm: SignatureAndHashAlgorithm,
    readonly signature: Vector<Number16, Opaque>
  ) { }

  size() {
    return this.algorithm.size() + this.signature.size()
  }

  write(cursor: Cursor) {
    this.algorithm.write(cursor)
    this.signature.write(cursor)
  }

  static read(cursor: Cursor) {
    const algorithm = SignatureAndHashAlgorithm.read(cursor)
    const signature = ReadableVector(Number16, SafeOpaque).read(cursor)

    return new this(algorithm, signature)
  }
}