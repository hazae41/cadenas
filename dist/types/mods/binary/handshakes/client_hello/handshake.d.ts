import { Binary } from '../../../../libs/binary.js';
import { Handshake } from '../handshake.js';
import { Number8, Number16 } from '../../number.js';
import { Vector } from '../../vector.js';

declare class ClientHello {
    readonly legacy_version: number;
    readonly random: Buffer;
    readonly legacy_session_id: Vector<Number8>;
    readonly cipher_suites: Vector<Number16>;
    readonly legacy_compression_methods: Vector<Number8>;
    readonly extensions?: Vector<Number16> | undefined;
    readonly class: typeof ClientHello;
    static type: number;
    constructor(legacy_version: number, random: Buffer, legacy_session_id: Vector<Number8>, cipher_suites: Vector<Number16>, legacy_compression_methods: Vector<Number8>, extensions?: Vector<Number16> | undefined);
    get type(): number;
    static default2(ciphers: number[]): ClientHello;
    static default3(ciphers: number[]): ClientHello;
    size(): number;
    write(binary: Binary): void;
    handshake(): Handshake;
}

export { ClientHello };
