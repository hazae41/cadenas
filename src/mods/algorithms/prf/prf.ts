import { Bytes, BytesError } from "@hazae41/bytes"
import { Ok, Result } from "@hazae41/result"
import { CryptoError, tryCrypto } from "libs/crypto/crypto.js"
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
async function A(key: CryptoKey, seed: Uint8Array, index: number): Promise<Result<Uint8Array, CryptoError | BytesError>> {
  return await Result.unthrow(async t => {
    if (index === 0)
      return new Ok(seed)

    const prev = await A(key, seed, index - 1).then(r => r.throw(t))
    const hmac = await HMAC(key, prev).then(r => r.throw(t))

    return new Ok(hmac)
  })
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
async function P(key: CryptoKey, seed: Uint8Array, length: number): Promise<Result<Uint8Array, CryptoError | BytesError>> {
  return await Result.unthrow(async t => {
    let result: Bytes = Bytes.tryEmpty().throw(t)

    for (let i = 1; result.length < length; i++)
      result = Bytes.concat([result, await HMAC(key, Bytes.concat([await A(key, seed, i).then(r => r.throw(t)), seed])).then(r => r.throw(t))])

    return new Ok(result.subarray(0, length))
  })
}

export async function PRF(hash: AlgorithmIdentifier, secret: Uint8Array, label: string, seed: Uint8Array, length: number): Promise<Result<Uint8Array, CryptoError | BytesError>> {
  return await Result.unthrow(async t => {
    const key = await tryCrypto(async () => {
      return await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash }, false, ["sign"])
    }).then(r => r.throw(t))

    return await P(key, Bytes.concat([Bytes.fromUtf8(label), seed]), length)
  })
}