import { Cursor } from "@hazae41/binary";

export interface Writable {
  size(): number
  write(cursor: Cursor): void
  export(): Uint8Array
}

export interface Unlengthed<T> {
  read(cursor: Cursor): T
}

export interface Lengthed<T> {
  read(cursor: Cursor, length: number): T
}