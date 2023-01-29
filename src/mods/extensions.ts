import { List } from "./binary/lists/writable.js"
import { Number16 } from "./binary/numbers/number16.js"
import { ECPointFormats } from "./binary/records/handshakes/extensions/ec_point_formats/ec_point_formats.js"
import { EllipticCurves } from "./binary/records/handshakes/extensions/elliptic_curves/elliptic_curves.js"
import { Extension } from "./binary/records/handshakes/extensions/extension.js"
import { SignatureAlgorithms } from "./binary/records/handshakes/extensions/signature_algorithms/signature_algorithms.js"
import { Extensions } from "./binary/records/handshakes/extensions/typed.js"
import { Vector } from "./binary/vectors/writable.js"

export interface ExtensionRecord {
  signature_algorithms?: SignatureAlgorithms,
  elliptic_curves?: EllipticCurves,
  ec_point_formats?: ECPointFormats
}

export function getClientExtensionRecord(vector?: Vector<Number16, List<Extension<Extensions>>>) {
  const record: ExtensionRecord = {}

  if (!vector) return record

  for (const extension of vector.value.array) {

    if (extension.data.value instanceof SignatureAlgorithms) {
      record.signature_algorithms = extension.data.value
      continue
    }

    else if (extension.data.value instanceof EllipticCurves) {
      record.elliptic_curves = extension.data.value
      continue
    }

    if (extension.data.value instanceof ECPointFormats) {
      record.ec_point_formats = extension.data.value
      continue
    }

    throw new Error(`Unknown extension type ${extension.subtype}`)
  }

  return record
}

export function getServerExtensionRecord(client_extensions: ExtensionRecord, vector?: Vector<Number16, List<Extension<Extensions>>>) {
  const server_extensions: ExtensionRecord = {}

  if (!vector) return server_extensions

  const types = new Set<number>()

  for (const extension of vector.value.array) {

    if (types.has(extension.subtype))
      throw new Error(`Duplicated extension type`)

    types.add(extension.subtype)

    if (extension.data.value instanceof SignatureAlgorithms) {
      if (!client_extensions.signature_algorithms)
        throw new Error(`Unexpected extention type ${extension.subtype}`)

      server_extensions.signature_algorithms = extension.data.value
      continue
    }

    else if (extension.data.value instanceof EllipticCurves) {
      if (!client_extensions.elliptic_curves)
        throw new Error(`Unexpected extention type ${extension.subtype}`)

      server_extensions.elliptic_curves = extension.data.value
      continue
    }

    else if (extension.data.value instanceof ECPointFormats) {
      if (!client_extensions.ec_point_formats)
        throw new Error(`Unexpected extention type ${extension.subtype}`)

      server_extensions.ec_point_formats = extension.data.value
      continue
    }

    throw new Error(`Unknown extension type ${extension.subtype}`)
  }

  return server_extensions
}