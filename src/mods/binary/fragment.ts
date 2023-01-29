import { Binary } from "@hazae41/binary";

export interface Writable {
  size(): number
  write(binary: Binary): void
  export(): Uint8Array
}

export interface Unlengthed<T> {
  read(binary: Binary): T
}

export interface Lengthed<T> {
  read(binary: Binary, length: number): T
}