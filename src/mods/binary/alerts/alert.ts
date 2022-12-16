import { Binary } from "@hazae41/binary"
import { Record } from "../record/record.js"

export class Alert {
  readonly #class = Alert

  static type = Record.types.alert

  static levels = {
    warning: 1,
    fatal: 2
  }

  static descriptions = {
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
  }

  constructor(
    readonly level: number,
    readonly description: number
  ) { }

  get class() {
    return this.#class
  }

  get type() {
    return this.#class.type
  }

  size() {
    return 1 + 1
  }

  write(binary: Binary) {
    binary.writeUint8(this.level)
    binary.writeUint8(this.description)
  }

  static read(binary: Binary, length: number) {
    const start = binary.offset

    const level = binary.readUint8()
    const description = binary.readUint8()

    if (binary.offset - start !== length)
      throw new Error(`Invalid ${this.name} length`)

    return new this(level, description)
  }

  record(version: number) {
    return Record.from(this, version)
  }
}