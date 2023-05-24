import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { ECPointFormatList } from "mods/binary/records/handshakes/extensions/ec_point_formats/ec_point_format_list.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";

export class ECPointFormats {
  readonly #class = ECPointFormats

  static readonly type = Extension.types.ec_point_formats

  constructor(
    readonly ec_point_format_list: ECPointFormatList
  ) { }

  static new(ec_point_format_list: ECPointFormatList) {
    return new ECPointFormats(ec_point_format_list)
  }

  static default() {
    return new this(ECPointFormatList.default())
  }

  trySize(): Result<number, never> {
    return this.ec_point_format_list.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.ec_point_format_list.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<ECPointFormats, BinaryReadError> {
    return ECPointFormatList.tryRead(cursor).mapSync(ECPointFormats.new)
  }

}