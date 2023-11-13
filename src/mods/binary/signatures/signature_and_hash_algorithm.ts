import { Cursor } from "@hazae41/cursor";
import { HashAlgorithm } from "mods/binary/signatures/hash_algorithm.js";
import { SignatureAlgorithm } from "mods/binary/signatures/signature_algorithm.js";

export class SignatureAndHashAlgorithm {

  static readonly instances = {
    rsaWithSha256: new this(HashAlgorithm.instances.sha256, SignatureAlgorithm.instances.rsa)
  } as const

  constructor(
    readonly hash: HashAlgorithm,
    readonly signature: SignatureAlgorithm
  ) { }

  sizeOrThrow() {
    return this.hash.sizeOrThrow() + this.signature.sizeOrThrow()
  }

  writeOrThrow(cursor: Cursor) {
    this.hash.writeOrThrow(cursor)
    this.signature.writeOrThrow(cursor)
  }

  static readOrThrow(cursor: Cursor) {
    const hash = HashAlgorithm.readOrThrow(cursor)
    const signature = SignatureAlgorithm.readOrThrow(cursor)

    return new SignatureAndHashAlgorithm(hash, signature)
  }

}