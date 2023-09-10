import { Base16 } from "@hazae41/base16";
import { Result } from "@hazae41/result";

export namespace BigInts {

  export function tryExport(value: bigint): Result<Uint8Array, Base16.DecodingError> {
    return Base16.get().tryPadStartAndDecode(value.toString(16)).mapSync(x => x.copyAndDispose())
  }

  export function tryImport(bytes: Uint8Array): Result<bigint, Base16.EncodingError> {
    return Base16.get().tryEncode(bytes).mapSync(x => BigInt("0x" + x))
  }

}