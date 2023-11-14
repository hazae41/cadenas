/**
 * @macro delete-next-lines
 */
import { $run$ } from "@hazae41/saumon"
import { PEM, X509 } from "@hazae41/x509"
import fs from "fs/promises"

import { Nullable } from "@hazae41/option"

export namespace CCADB {

  export interface Trusted {
    readonly publicKeyHex: string
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

        const issuer = x509.tbsCertificate.issuer.toX501OrThrow()
        const publicKey = X509.writeToBytesOrThrow(x509.tbsCertificate.subjectPublicKeyInfo)
        const publicKeyHex = Buffer.from(publicKey).toString("hex")

        if (trusteds[issuer])
          console.warn(`Duplicate issuer: ${issuer}`)

        if (notAfter)
          trusteds[issuer] = { notAfter, publicKeyHex }
        else
          trusteds[issuer] = { publicKeyHex }
      } catch (e: unknown) {
        console.warn(e)
      }
    }

    return trusteds
  })

}