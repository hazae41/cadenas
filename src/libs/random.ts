export function generateRandom(length: number) {
  const buffer = Buffer.allocUnsafe(length)
  crypto.getRandomValues(buffer)
  return buffer
}