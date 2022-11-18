import { Binary } from '../../libs/binary.js';
import { Vector, Number16, Number8 } from './vector.js';

declare class ClientHello {
    readonly legacy_version: number;
    readonly random: Buffer;
    readonly legacy_session_id: Vector<never>;
    readonly cipher_suites: Vector<Number16>;
    readonly legacy_compression_methods: Vector<Number8>;
    readonly extensions: Vector<never>;
    readonly class: typeof ClientHello;
    constructor(legacy_version?: number, random?: Buffer, legacy_session_id?: Vector<never>, cipher_suites?: Vector<Number16>, legacy_compression_methods?: Vector<Number8>, extensions?: Vector<never>);
    size(): number;
    write(binary: Binary): void;
    export(): Binary;
}

export { ClientHello };
