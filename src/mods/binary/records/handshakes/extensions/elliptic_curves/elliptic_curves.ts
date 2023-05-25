import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Result } from "@hazae41/result";
import { NamedCurveList } from "mods/binary/records/handshakes/extensions/elliptic_curves/named_curve_list.js";
import { Extension } from "mods/binary/records/handshakes/extensions/extension.js";

export class EllipticCurves {
  readonly #class = EllipticCurves

  static readonly extension_type = Extension.types.elliptic_curves

  constructor(
    readonly named_curve_list: NamedCurveList
  ) { }

  static new(named_curve_list: NamedCurveList) {
    return new EllipticCurves(named_curve_list)
  }

  static default() {
    return new this(NamedCurveList.default())
  }

  get extension_type() {
    return this.#class.extension_type
  }

  trySize(): Result<number, never> {
    return this.named_curve_list.trySize()
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return this.named_curve_list.tryWrite(cursor)
  }

  static tryRead(cursor: Cursor): Result<EllipticCurves, BinaryReadError> {
    return NamedCurveList.tryRead(cursor).mapSync(EllipticCurves.new)
  }

}