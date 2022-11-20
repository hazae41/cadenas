import { Binary } from '../../../../libs/binary.js';
import { Number8, Number16 } from '../../number.js';
import { Random } from '../../random.js';
import { Vector } from '../../vector.js';

declare class ServerHello2 {
    readonly server_version: number;
    readonly random: Random;
    readonly session_id: Vector<Number8>;
    readonly cipher_suite: number;
    readonly compression_methods: Vector<Number8>;
    readonly extensions?: Vector<Number16> | undefined;
    readonly class: typeof ServerHello2;
    static type: number;
    constructor(server_version: number, random: Random, session_id: Vector<Number8>, cipher_suite: number, compression_methods: Vector<Number8>, extensions?: Vector<Number16> | undefined);
    static read(binary: Binary, length: number): ServerHello2;
}

export { ServerHello2 };
