import { Binary } from "@hazae41/binary";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";
import { ECPointFormatList } from "./ec_point_format_list.js";

export class EllipticPointFormats {
  readonly #class = EllipticPointFormats

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

  write(binary: Binary) {
    this.ec_point_format_list.write(binary)
  }

  export() {
    const binary = Binary.allocUnsafe(this.size())
    this.write(binary)
    return binary.bytes
  }

  extension() {
    return Extension.from(this.#class.type, this)
  }

  static read(binary: Binary) {
    const ec_point_format_list = ECPointFormatList.read(binary)

    return new this(ec_point_format_list)
  }
}