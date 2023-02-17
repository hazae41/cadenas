import { Cursor } from "@hazae41/binary"
import { PlaintextRecord, Record } from "mods/binary/records/record.js"

export class Alert {
  readonly #class = Alert

  static readonly type = Record.types.alert

  static readonly levels = {
    warning: 1,
    fatal: 2
  } as const

  static readonly descriptions = {
    close_notify: 0,
    unexpected_message: 10,
    bad_record_mac: 20,
    record_overflow: 22,
    handshake_failure: 40,
    bad_certificate: 42,
    unsupported_certificate: 43,
    certificate_revoked: 44,
    certificate_expired: 45,
    certificate_unknown: 46,
    illegal_parameter: 47,
    unknown_ca: 48,
    access_denied: 49,
    decode_error: 50,
    decrypt_error: 51,
    protocol_version: 70,
    insufficient_security: 71,
    internal_error: 80,
    inappropriate_fallback: 86,
    user_canceled: 90,
    missing_extension: 109,
    unsupported_extension: 110,
    unrecognized_name: 112,
    bad_certificate_status_response: 113,
    unknown_psk_identity: 115,
    certificate_required: 116,
    no_application_protocol: 120,
  } as const

  constructor(
    readonly level: number,
    readonly description: number
  ) { }

  get type() {
    return this.#class.type
  }

  size() {
    return 1 + 1
  }

  write(cursor: Cursor) {
    cursor.writeUint8(this.level)
    cursor.writeUint8(this.description)
  }

  export() {
    const cursor = Cursor.allocUnsafe(this.size())
    this.write(cursor)
    return cursor.bytes
  }

  record(version: number) {
    return new PlaintextRecord<Alert>(this.#class.type, version, this)
  }

  static read(cursor: Cursor, length: number) {
    const start = cursor.offset

    const level = cursor.readUint8()
    const description = cursor.readUint8()

    if (cursor.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(level, description)
  }
}