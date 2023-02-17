import { Cursor } from "@hazae41/binary";
import { ReadableList } from "mods/binary/lists/readable.js";
import { List } from "mods/binary/lists/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";
import { SignatureAndHashAlgorithm } from "mods/binary/signatures/signature_and_hash_algorithm.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
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

  write(cursor: Cursor) {
    this.supported_signature_algorithms.write(cursor)
  }

  extension() {
    return Extension.from(this.#class.type, this)
  }

  static read(cursor: Cursor) {
    const supported_signature_algorithms = ReadableVector(Number16, ReadableList(SignatureAndHashAlgorithm)).read(cursor)

    return new this(supported_signature_algorithms)
  }
}