import { Cursor } from "@hazae41/binary";
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

  size() {
    return this.hash.size() + this.signature.size()
  }

  write(cursor: Cursor) {
    this.hash.write(cursor)
    this.signature.write(cursor)
  }

  static read(cursor: Cursor) {
    const hash = HashAlgorithm.read(cursor)
    const signature = SignatureAlgorithm.read(cursor)

    return new this(hash, signature)
  }
}