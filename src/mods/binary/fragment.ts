import { Binary } from "@hazae41/binary";
import { Writable } from "mods/binary/writable.js";

export interface UnlengthedClass<T extends Unlengthed<T> = Unlengthed> {
  read(binary: Binary): T
}

export interface Unlengthed<T extends Unlengthed<T> = any> extends Writable {
  readonly class: UnlengthedClass<T>
}

export interface LengthedClass<T extends Lengthed<T> = Lengthed> {
  read(binary: Binary, length: number): T
}

export interface Lengthed<T extends Lengthed<T> = any> extends Writable {
  readonly class: LengthedClass<T>
}