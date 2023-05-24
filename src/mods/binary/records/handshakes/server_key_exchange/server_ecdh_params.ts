import { BinaryReadError, BinaryWriteError } from "@hazae41/binary";
import { Cursor } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { ECParameters } from "./ec_parameters.js";
import { ECPoint } from "./ec_point.js";

export class ServerECDHParams {

  constructor(
    readonly curve_params: ECParameters,
    readonly public_point: ECPoint
  ) { }

  trySize(): Result<number, never> {
    return new Ok(this.curve_params.trySize().get() + this.public_point.trySize().get())
  }

  tryWrite(cursor: Cursor): Result<void, BinaryWriteError> {
    return Result.unthrowSync(t => {
      this.curve_params.tryWrite(cursor).throw(t)
      this.public_point.tryWrite(cursor).throw(t)

      return Ok.void()
    })
  }

  static tryRead(cursor: Cursor): Result<ServerECDHParams, BinaryReadError> {
    return Result.unthrowSync(t => {
      const curve_params = ECParameters.tryRead(cursor).throw(t)
      const public_point = ECPoint.tryRead(cursor).throw(t)

      return new Ok(new ServerECDHParams(curve_params, public_point))
    })
  }

}