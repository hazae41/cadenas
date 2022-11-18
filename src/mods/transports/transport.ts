import { Promisable } from "libs/promisable.js"

export interface Transport extends EventTarget {
  send(buffer: Buffer): Promisable<void>
}