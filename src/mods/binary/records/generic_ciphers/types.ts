import { ReadableLenghted } from "mods/binary/readable.js"
import { CiphertextGenericBlockCipher, PlaintextGenericBlockCipher } from "mods/binary/records/generic_ciphers/block/block.js"
import { Exportable, Writable } from "mods/binary/writable.js"

export type PlaintextGenericCipher<T extends Writable & Exportable & ReadableLenghted<T>> =
  | PlaintextGenericBlockCipher<T>

export type CiphertextGenericCipher<T extends Writable & Exportable> =
  | CiphertextGenericBlockCipher<T>
