import { Binary } from "@hazae41/binary";
import { HashAlgorithm } from "mods/binary/signatures/hash_algorithm.js";
import { SignatureAlgorithm } from "mods/binary/signatures/signature_algorithm.js";

export class SignatureAndHashAlgorithm {
  readonly #class = SignatureAndHashAlgorithm

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

  write(binary: Binary) {
    this.hash.write(binary)
    this.signature.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    const hash = HashAlgorithm.read(binary)
    const signature = SignatureAlgorithm.read(binary)

    return new this(hash, signature)
  }
}