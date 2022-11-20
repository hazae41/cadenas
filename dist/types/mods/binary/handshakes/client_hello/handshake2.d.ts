import { Binary } from '../../../../libs/binary.js';
import { Handshake } from '../handshake.js';
import { Number8, Number16 } from '../../number.js';
import { Random } from '../../random.js';
import { Vector } from '../../vector.js';

declare class ClientHello2 {
    readonly version: number;
    readonly random: Random;
    readonly session_id: Vector<Number8>;
    readonly cipher_suites: Vector<Number16>;
    readonly compression_methods: Vector<Number8>;
    readonly extensions?: Vector<Number16> | undefined;
    readonly class: typeof ClientHello2;
    static type: number;
    constructor(version: number, random: Random, session_id: Vector<Number8>, cipher_suites: Vector<Number16>, compression_methods: Vector<Number8>, extensions?: Vector<Number16> | undefined);
    get type(): number;
    static default(ciphers: number[]): ClientHello2;
    size(): number;
    write(binary: Binary): void;
    handshake(): Handshake;
}

export { ClientHello2 };
