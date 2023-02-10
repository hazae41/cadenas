import { Binary } from "@hazae41/binary";

export interface Writable {
  size(): number
  write(cursor: Binary): void
  export(): Uint8Array
}

export interface Unlengthed<T> {
  read(cursor: Binary): T
}

export interface Lengthed<T> {
  read(cursor: Binary, length: number): T
}