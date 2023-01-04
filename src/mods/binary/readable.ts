import { Binary } from "@hazae41/binary"
import { Writable } from "mods/binary/writable.js"

export interface Readable<T extends Writable> {
  class: {
    read(binary: Binary): T
  }
}

export interface ReadableChecked<T extends Writable> {
  class: {
    read(binary: Binary, length: number): T
  }
}