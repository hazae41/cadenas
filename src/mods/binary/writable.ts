import { Binary } from "libs/binary.js"

export interface Writable {
  size(): number
  write(binary: Binary): void
}