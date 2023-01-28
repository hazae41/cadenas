import { Writable } from "mods/binary/writable.js"

export interface Array<T extends Writable> extends Writable {
  readonly array: T[]
}