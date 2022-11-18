import { Binary } from '../../../../libs/binary.js';
import { Handshake } from '../handshake.js';
import { OpaqueVector, Number8, Vector16, Number16, Vector } from '../../vector.js';

declare class ClientHello {
    readonly legacy_version: number;
    readonly random: Buffer;
    readonly legacy_session_id: OpaqueVector<Number8>;
    readonly cipher_suites: Vector16<Number16>;
    readonly legacy_compression_methods: OpaqueVector<Number8>;
    readonly extensions: Vector<Number16>;
    readonly class: typeof ClientHello;
    static type: number;
    constructor(legacy_version: number, random: Buffer, legacy_session_id: OpaqueVector<Number8>, cipher_suites: Vector16<Number16>, legacy_compression_methods: OpaqueVector<Number8>, extensions: Vector<Number16>);
    get type(): number;
    static default3(): ClientHello;
    size(): number;
    write(binary: Binary): void;
    handshake(): Handshake;
}

export { ClientHello };
