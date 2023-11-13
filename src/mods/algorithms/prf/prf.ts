import { Bytes } from "@hazae41/bytes"
import { Result } from "@hazae41/result"
import { CryptoError } from "libs/crypto/crypto.js"

export async function hmacOrThrow(key: CryptoKey, seed: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, seed))
}

/**
 * Naive implementation, just for testing
 * 
 * Could be improved using greedy or iteration
 * @param hash 
 * @param secret 
 * @param seed 
 * @param index 
 * @returns 
 */
async function A(key: CryptoKey, seed: Uint8Array, index: number): Promise<Uint8Array> {
  if (index === 0)
    return seed

  const prev = await A(key, seed, index - 1)
  const hmac = await hmacOrThrow(key, prev)

  return hmac
}

/**
 * Naive implementation, just for testing
 * 
 * Could be improved using greedy
 * @param hash 
 * @param secret 
 * @param seed 
 * @param length 
 * @returns 
 */
async function P(key: CryptoKey, seed: Uint8Array, length: number): Promise<Uint8Array> {
  let result: Bytes = Bytes.empty()

  for (let i = 1; result.length < length; i++)
    result = Bytes.concat([result, await hmacOrThrow(key, Bytes.concat([await A(key, seed, i), seed]))])

  return result.subarray(0, length)
}

export async function prfOrThrow(hash: AlgorithmIdentifier, secret: Uint8Array, label: string, seed: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash }, false, ["sign"])
  const prf = await P(key, Bytes.concat([Bytes.fromUtf8(label), seed]), length)

  return prf
}

export async function tryPrf(hash: AlgorithmIdentifier, secret: Uint8Array, label: string, seed: Uint8Array, length: number): Promise<Result<Uint8Array, CryptoError>> {
  return await Result.runAndWrap(async () => {
    return prfOrThrow(hash, secret, label, seed, length)
  }).then(r => r.mapErrSync(CryptoError.from))
}