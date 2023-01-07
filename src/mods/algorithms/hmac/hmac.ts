export async function HMAC(key: CryptoKey, seed: Buffer) {
  return Buffer.from(await crypto.subtle.sign("HMAC", key, seed))
}