import { Binary } from "@hazae41/binary";
import { Number16 } from "mods/binary/number.js";
import { Opaque } from "mods/binary/opaque.js";
import { LengthedVector } from "mods/binary/vectors/lengthed.js";
import { Vector } from "mods/binary/vectors/vector.js";

export class HashAlgorithm {
  readonly #class = HashAlgorithm

  static readonly types = {
    none: 0,
    md5: 1,
    sha1: 2,
    sha224: 3,
    sha256: 4,
    sha384: 5,
    sha512: 6,
  } as const

  static readonly instances = {
    none: new this(this.types.none),
    md5: new this(this.types.md5),
    sha1: new this(this.types.sha1),
    sha224: new this(this.types.sha224),
    sha256: new this(this.types.sha256),
    sha384: new this(this.types.sha384),
    sha512: new this(this.types.sha512)
  } as const

  constructor(
    readonly type: number
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.type)
  }

  static read(binary: Binary) {
    return new this(binary.readUint8())
  }
}

export class SignatureAlgorithm {
  readonly #class = SignatureAlgorithm

  static readonly types = {
    anonymous: 0,
    rsa: 1,
    dsa: 2,
    ecdsa: 3
  } as const

  static readonly instances = {
    anonymous: new this(this.types.anonymous),
    rsa: new this(this.types.rsa),
    dsa: new this(this.types.dsa),
    ecdsa: new this(this.types.ecdsa)
  } as const

  constructor(
    readonly type: number
  ) { }

  get class() {
    return this.#class
  }

  size() {
    return 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.type)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  static read(binary: Binary) {
    return new this(binary.readUint8())
  }
}

export class SignatureAndHashAlgorithm {
  readonly #class = SignatureAndHashAlgorithm

  static readonly instances = {
    rsaWithSha256: new this(HashAlgorithm.instances.sha256, SignatureAlgorithm.instances.rsa)
  } as const

  constructor(
    readonly hash: HashAlgorithm,
    readonly signature: SignatureAlgorithm
  ) { }

  get class() {
    return this.#class
  }

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
    const signature = LengthedVector(Number16, Opaque).read(binary)

    return new this(algorithm, signature)
  }
}