
export interface Transport extends EventTarget {
  send(buffer: Uint8Array): void | Promise<void>
}