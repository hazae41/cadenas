import { assert, test } from "@hazae41/phobos"
import { Bytes } from "libs/bytes/bytes.js"
import { relative, resolve } from "path"
import { PRF } from "./prf.js"

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".cjs", ".ts")))

test("PRF (master secret)", async ({ message }) => {
  const premaster_secret = Bytes.random(128)

  const client_random = Bytes.random(32)
  const server_random = Bytes.random(32)

  const start = Date.now()

  const seed = Bytes.concat([client_random, server_random])
  const result = await PRF("SHA-1", premaster_secret, "master secret", seed, 48)

  const end = Date.now()

  assert(result.length === 48, `result length should be 48`)

  console.info(message, "took", end - start, "ms")
})