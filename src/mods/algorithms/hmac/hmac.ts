import { Result } from "@hazae41/result";
import { CryptoError, tryCrypto } from "libs/crypto/crypto.js";

export async function HMAC(key: CryptoKey, seed: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
  return await tryCrypto(async () => new Uint8Array(await crypto.subtle.sign("HMAC", key, seed)))
}