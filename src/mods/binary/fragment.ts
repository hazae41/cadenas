import { Cursor } from "@hazae41/binary";

export interface Unlengthed<T> {
  read(cursor: Cursor): T
}

export interface Lengthed<T> {
  read(cursor: Cursor, length: number): T
}