import { Binary } from "libs/binary.js"

export interface Readable<T> {
  class: {
    read(binary: Binary): T
  }
}

export interface ReadableChecked<T> {
  class: {
    read(binary: Binary, length: number): T
  }
}