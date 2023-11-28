/**
 * @macro delete-next-lines
 */
import { $run$ } from "@hazae41/saumon"
import { PEM, X509 } from "@hazae41/x509"
import fs from "fs/promises"

import { Writable } from "@hazae41/binary"
import { Nullable } from "@hazae41/option"

export namespace CCADB {

  export interface Trusted {
    readonly certHex: string
    readonly notAfter?: string
  }

  export const trusteds: Record<string, Nullable<Trusted>> = $run$(async () => {
    interface Row {
      "Distrust for TLS After Date": string,
      "Mozilla Applied Constraints": string
      "PEM": `'${string}'`
    }

    const ccadb = await fs.readFile("./tools/ccadb/ccadb.json", "utf8")
    const certs = JSON.parse(ccadb) as Row[]

    const trusteds: Record<string, Trusted> = {}

    for (const cert of certs) {
      const notAfter = cert["Distrust for TLS After Date"]

      if (notAfter && new Date() > new Date(notAfter))
        continue

      if (cert["Mozilla Applied Constraints"])
        continue

      try {
        const pem = PEM.tryDecode(cert.PEM.slice(1, -1)).unwrap()
        const x509 = X509.readAndResolveFromBytesOrThrow(X509.Certificate, pem)

        const spki = Writable.writeToBytesOrThrow(x509.tbsCertificate.subjectPublicKeyInfo.toDER())
        const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", spki))

        const hashHex = Buffer.from(hash).toString("hex")
        const certHex = Buffer.from(pem).toString("hex")

        if (trusteds[hashHex])
          console.warn(`Duplicate spki: ${hashHex}`)

        if (notAfter)
          trusteds[hashHex] = { notAfter, certHex }
        else
          trusteds[hashHex] = { certHex }
      } catch (e: unknown) {
        console.warn(e)
      }
    }

    return trusteds
  })

}