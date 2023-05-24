/**
 * Modified from https://github.com/juanelas/bigint-mod-arith
 */

import { Panic } from "@hazae41/result"

const b0 = BigInt(0)
const b1 = BigInt(1)
const b2 = BigInt(2)

/**
 * Unsigned modulo
 * @param value 
 * @param modulus 
 * @returns smallest positive number
 */
export function umod(value: bigint, modulus: bigint): bigint {
  if (modulus <= b0)
    throw new Panic(`modulus < 0`)

  const modulo = value % modulus

  if (modulo >= b0)
    return modulo

  return modulo + modulus
}

/**
 * Unsigned modulo and power
 * @param base 
 * @param exponent 
 * @param modulus 
 * @returns 
 */
export function umodpow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (base <= b0)
    throw new Panic(`base < 0`)
  if (exponent <= b0)
    throw new Panic(`exponent < 0`)
  if (modulus <= b0)
    throw new Panic(`modulus < 0`)

  if (modulus === b1)
    return b0

  let result = b1

  while (exponent > 0) {
    if ((exponent % b2) === b1)
      result = (result * base) % modulus

    exponent = exponent / b2
    base = (base ** b2) % modulus
  }

  return result
}

