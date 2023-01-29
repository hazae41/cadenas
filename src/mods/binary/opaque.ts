import { Binary } from "@hazae41/binary"
import { LengthedClass, Writable } from "mods/binary/fragment.js"

export class Opaque {
  readonly #class = Opaque

  /**
   * Bytes fragment with zero-copy reading
   * @param bytes 
   */
  constructor(
    readonly bytes: Uint8Array
  ) { }

  static empty() {
    return new this(new Uint8Array())
  }

  get class() {
    return this.#class
  }

  static from(fragment: Writable) {
    return new this(fragment.export())
  }

  into<T extends Writable>(clazz: LengthedClass<T>) {
    return clazz.read(new Binary(this.bytes), this.bytes.length)
  }

  size() {
    return this.bytes.length
  }

  write(binary: Binary) {
    binary.write(this.bytes)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  /**
   * Zero-copy read
   * @param binary 
   * @param length 
   * @returns 
   */
  static read(binary: Binary, length: number) {
    const buffer = binary.read(length)

    return new this(buffer)
  }
}

export class SafeOpaque extends Opaque {
  readonly #class = SafeOpaque

  /**
   * Bytes fragment with safe reading
   * @param bytes 
   */
  constructor(
    readonly bytes: Uint8Array
  ) {
    super(bytes)
  }

  get class() {
    return this.#class
  }

  /**
   * Safe read
   * @param binary 
   * @param length 
   * @returns 
   */
  static read(binary: Binary, length: number) {
    const buffer = new Uint8Array(binary.read(length))

    return new this(buffer)
  }
}