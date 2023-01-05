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
async function A(hash: AlgorithmIdentifier, secret: Buffer, seed: Buffer, index: number): Promise<Buffer> {
  if (index === 0)
    return seed
  return await HMAC(hash, secret, await A(hash, secret, seed, index - 1))
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
async function P(hash: AlgorithmIdentifier, secret: Buffer, seed: Buffer, length: number) {
  let result = Buffer.allocUnsafe(0)

  for (let i = 1; result.length < length; i++)
    result = Buffer.concat([result, await HMAC(hash, secret, Buffer.concat([await A(hash, secret, seed, i), seed]))])

  return result.subarray(0, length)
}

export async function PRF(hash: AlgorithmIdentifier, secret: Buffer, label: string, seed: Buffer, length: number) {
  return await P(hash, secret, Buffer.concat([Buffer.from(label, "ascii"), seed]), length)
}