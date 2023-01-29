import { Binary } from "@hazae41/binary";

export interface Writable {
  size(): number
  write(binary: Binary): void
  export(): Uint8Array
}

export interface UnlengthedClass<T> {
  read(binary: Binary): T
}

export interface Unlengthed<T = any> {
  readonly class: UnlengthedClass<T>
}

export interface LengthedClass<T> {
  read(binary: Binary, length: number): T
}

export interface Lengthed<T = any> {
  readonly class: LengthedClass<T>
}