export async function HMAC(hash: AlgorithmIdentifier, secret: Buffer, seed: Buffer) {
  const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash }, false, ["sign"])
  return Buffer.from(await crypto.subtle.sign("HMAC", key, seed))
}