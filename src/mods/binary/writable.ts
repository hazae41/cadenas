import { Binary } from "@hazae41/binary"

export interface Writable {
  size(): number
  write(binary: Binary): void
}