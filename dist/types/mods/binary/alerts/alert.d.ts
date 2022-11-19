import { Binary } from '../../../libs/binary.js';
import { Record } from '../record/record.js';

declare class Alert {
    readonly level: number;
    readonly description: number;
    readonly class: typeof Alert;
    static type: number;
    static levels: {
        warning: number;
        fatal: number;
    };
    static descriptions: {
        close_notify: number;
        unexpected_message: number;
        bad_record_mac: number;
        record_overflow: number;
        handshake_failure: number;
        bad_certificate: number;
        unsupported_certificate: number;
        certificate_revoked: number;
        certificate_expired: number;
        certificate_unknown: number;
        illegal_parameter: number;
        unknown_ca: number;
        access_denied: number;
        decode_error: number;
        decrypt_error: number;
        protocol_version: number;
        insufficient_security: number;
        internal_error: number;
        inappropriate_fallback: number;
        user_canceled: number;
        missing_extension: number;
        unsupported_extension: number;
        unrecognized_name: number;
        bad_certificate_status_response: number;
        unknown_psk_identity: number;
        certificate_required: number;
        no_application_protocol: number;
    };
    constructor(level: number, description: number);
    get type(): number;
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary): Alert;
    record(version: number): Record;
}

export { Alert };
