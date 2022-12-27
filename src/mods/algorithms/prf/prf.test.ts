import { assert, test } from "@hazae41/phobos"
import crypto from "crypto"
import { relative, resolve } from "path"
import { PRF } from "./prf.js"

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".cjs", ".ts")))

test("PRF (master secret)", async ({ message }) => {
  const premaster_secret = Buffer.allocUnsafe(128)

  crypto.getRandomValues(premaster_secret)

  const client_random = Buffer.allocUnsafe(32)
  const server_random = Buffer.allocUnsafe(32)

  crypto.getRandomValues(client_random)
  crypto.getRandomValues(server_random)

  const start = Date.now()

  const seed = Buffer.concat([client_random, server_random])
  const result = await PRF("SHA-1", premaster_secret, "master secret", seed, 48)

  const end = Date.now()

  assert(result.length === 48, `result length should be 48`)

  console.info(message, "took", end - start, "ms")
})