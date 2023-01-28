import { Binary } from "@hazae41/binary";

export interface UnlengthedClass<T extends Unlengthed<T> = Unlengthed> {
  read(binary: Binary): T
}

export interface Unlengthed<T extends Unlengthed<T> = any> {
  readonly class: UnlengthedClass<T>

  size(): number
  write(binary: Binary): void
}

export interface LengthedClass<T extends Lengthed<T> = Lengthed> {
  read(binary: Binary, length: number): T
}

export interface Lengthed<T extends Lengthed<T> = any> {
  readonly class: LengthedClass<T>

  size(): number
  write(binary: Binary): void
}