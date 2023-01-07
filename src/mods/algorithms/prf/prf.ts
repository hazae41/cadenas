import { HMAC } from "mods/algorithms/hmac/hmac.js"

/**
 * Naive implementation, just for testing
 * Could be improved using greedy or iteration
 * @param hash 
 * @param secret 
 * @param seed 
 * @param index 
 * @returns 
 */
async function A(key: CryptoKey, seed: Buffer, index: number): Promise<Buffer> {
  if (index === 0)
    return seed
  return await HMAC(key, await A(key, seed, index - 1))
}

/**
 * Naive implementation, just for testing
 * Could be improved using greedy
 * @param hash 
 * @param secret 
 * @param seed 
 * @param length 
 * @returns 
 */
async function P(key: CryptoKey, seed: Buffer, length: number) {
  let result = Buffer.allocUnsafe(0)

  for (let i = 1; result.length < length; i++)
    result = Buffer.concat([result, await HMAC(key, Buffer.concat([await A(key, seed, i), seed]))])

  return result.subarray(0, length)
}

export async function PRF(hash: AlgorithmIdentifier, secret: Buffer, label: string, seed: Buffer, length: number) {
  const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash }, false, ["sign"])
  return await P(key, Buffer.concat([Buffer.from(label, "ascii"), seed]), length)
}