import { Cursor } from "@hazae41/binary"
import { Lengthed, Writable } from "mods/binary/fragment.js"

export class Opaque {
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

  static from(fragment: Writable) {
    return new this(fragment.export())
  }

  into<T extends Writable>(clazz: Lengthed<T>) {
    return clazz.read(new Cursor(this.bytes), this.bytes.length)
  }

  size() {
    return this.bytes.length
  }

  write(cursor: Cursor) {
    cursor.write(this.bytes)
  }

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  /**
   * Zero-copy read
   * @param binary 
   * @param length 
   * @returns 
   */
  static read(cursor: Cursor, length: number) {
    const buffer = cursor.read(length)

    return new this(buffer)
  }
}

export class SafeOpaque extends Opaque {
  /**
   * Bytes fragment with safe reading
   * @param bytes 
   */
  constructor(
    readonly bytes: Uint8Array
  ) {
    super(bytes)
  }

  /**
   * Safe read
   * @param binary 
   * @param length 
   * @returns 
   */
  static read(cursor: Cursor, length: number) {
    const buffer = new Uint8Array(cursor.read(length))

    return new this(buffer)
  }
}