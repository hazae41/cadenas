export async function HMAC(key: CryptoKey, seed: Uint8Array) {
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, seed))
}