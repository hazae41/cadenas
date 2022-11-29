import { Binary } from "libs/binary.js"
import { NumberX } from "mods/binary/number.js"

export interface Readable<T> {
  class: {
    read(binary: Binary): T
  }
}

export interface VlengthReadable<T, L extends NumberX = any> {
  class: {
    read(binary: Binary, vlength: L["class"]): T
  }
}