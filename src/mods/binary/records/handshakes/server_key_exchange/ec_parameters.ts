import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { NamedCurve } from "mods/binary/records/handshakes/extensions/elliptic_curves/named_curve.js";
import { ECCurveType } from "./ec_curve_type.js";

export class ECParameters {

  constructor(
    readonly curve_type: ECCurveType,
    readonly named_curve: NamedCurve
  ) { }

  trySize(): Result<number, never> {
    return new Ok(this.curve_type.trySize().get() + this.named_curve.trySize().get())
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      this.curve_type.tryWrite(cursor).throw(t)
      this.named_curve.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<ECParameters, BinaryReadError> {
    return Result.unthrowSync(t => {
      const curve_type = ECCurveType.tryRead(cursor).throw(t)
      const named_curve = NamedCurve.tryRead(cursor).throw(t)

      return new Ok(new ECParameters(curve_type, named_curve))
    })
  }

}