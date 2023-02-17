import { Cursor } from "@hazae41/binary";
import { ECPointFormatList } from "mods/binary/records/handshakes/extensions/ec_point_formats/ec_point_format_list.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";

export class ECPointFormats {
  readonly #class = ECPointFormats

  static readonly type = Extension.types.ec_point_formats

  constructor(
    readonly ec_point_format_list: ECPointFormatList
  ) { }

  static default() {
    return new this(ECPointFormatList.default())
  }

  size() {
    return this.ec_point_format_list.size()
  }

  write(cursor: Cursor) {
    this.ec_point_format_list.write(cursor)
  }

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  extension() {
    return Extension.from(this.#class.type, this)
  }

  static read(cursor: Cursor) {
    const ec_point_format_list = ECPointFormatList.read(cursor)

    return new this(ec_point_format_list)
  }
}