import { Base16 } from "@hazae41/base16";
import { BytesOrCopiable } from "@hazae41/box";

export namespace BigBytes {

  export function exportOrThrow(value: bigint) {
    return Base16.get().padStartAndDecodeOrThrow(value.toString(16))
  }

  export function importOrThrow(bytes: BytesOrCopiable) {
    return BigInt("0x" + Base16.get().encodeOrThrow(bytes))
  }

}