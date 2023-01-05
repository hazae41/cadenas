import { Binary } from "@hazae41/binary"

export interface Readable<T> {
  class: {
    read(binary: Binary): T
  }
}

export interface ReadableLenghted<T> {
  class: {
    read(binary: Binary, length: number): T
  }
}