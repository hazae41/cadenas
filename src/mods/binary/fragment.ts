import { Cursor } from "@hazae41/binary";

export interface Lengthed<T> {
  read(cursor: Cursor, length: number): T
}