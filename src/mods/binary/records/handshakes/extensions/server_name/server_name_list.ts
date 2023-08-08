import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { ReadableList } from "mods/binary/lists/readable.js";
import { List } from "mods/binary/lists/writable.js";
import { Number16 } from "mods/binary/numbers/number16.js";
import { ReadableVector } from "mods/binary/vectors/readable.js";
import { Vector } from "mods/binary/vectors/writable.js";
import { Extension } from "../extension.js";
import { ServerName } from "./server_name.js";

export class ServerNameList {
  readonly #class = ServerNameList

  static readonly extension_type = Extension.types.server_name

  constructor(
    readonly server_name_list: Vector<Number16, List<ServerName>>
  ) { }

  static new(server_name_list: Vector<Number16, List<ServerName>>) {
    return new ServerNameList(server_name_list)
  }

  // static default(host_name: string) {
  //   const { secp256r1, secp384r1, secp521r1, x25519, x448 } = NamedCurve.instances

  //   return this.from([secp256r1]) // TODO
  // }

  static from(server_names: ServerName[]) {
    const server_name_list = Vector(Number16).from(List.from(server_names))

    return new ServerNameList(server_name_list)
  }

  get extension_type() {
    return this.#class.extension_type
  }

  trySize(): Result<number, never> {
    return this.server_name_list.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.server_name_list.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<ServerNameList, BinaryReadError> {
    return ReadableVector(Number16, ReadableList(ServerName)).tryRead(cursor).mapSync(ServerNameList.new)
  }

}