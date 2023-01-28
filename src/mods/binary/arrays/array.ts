import { Writable } from "mods/binary/fragment.js"

export interface Array<T extends Writable> extends Writable {
  readonly array: T[]
}