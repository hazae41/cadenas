import { Binary } from "libs/binary.js"

export interface Readable<T> {
  class: {
    read(binary: Binary): T
  }
}