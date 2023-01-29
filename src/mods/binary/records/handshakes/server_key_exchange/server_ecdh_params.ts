import { Binary } from "@hazae41/binary";
import { ECParameters } from "./ec_parameters.js";
import { ECPoint } from "./ec_point.js";

export class ServerECDHParams {

  constructor(
    readonly curve_params: ECParameters,
    readonly public_point: ECPoint
  ) { }

  size() {
    return this.curve_params.size() + this.public_point.size()
  }

  write(binary: Binary) {
    this.curve_params.write(binary)
    this.public_point.write(binary)
  }

  static read(binary: Binary) {
    const curve_params = ECParameters.read(binary)
    const public_point = ECPoint.read(binary)

    return new this(curve_params, public_point)
  }
}