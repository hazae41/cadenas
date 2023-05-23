import { Bytes } from "@hazae41/bytes"
import { HMAC } from "mods/algorithms/hmac/hmac.js"

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
  return await HMAC(key, await A(key, seed, index - 1))
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
async function P(key: CryptoKey, seed: Uint8Array, length: number) {
  let result: Bytes = Bytes.empty()

  for (let i = 1; result.length < length; i++)
    result = Bytes.concat([result, await HMAC(key, Bytes.concat([await A(key, seed, i), seed]))])

  return result.subarray(0, length)
}

export async function PRF(hash: AlgorithmIdentifier, secret: Uint8Array, label: string, seed: Uint8Array, length: number) {
  const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash }, false, ["sign"])
  return await P(key, Bytes.concat([Bytes.fromUtf8(label), seed]), length)
}