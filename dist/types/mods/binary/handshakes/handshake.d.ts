import { Binary } from '../../../libs/binary.js';
import { ClientHello2, ClientHello3 } from './client_hello/handshake.js';
import { Record } from '../record/record.js';

type Handshakes = ClientHello2 | ClientHello3;
declare class Handshake {
    readonly handshake: Handshakes;
    readonly class: typeof Handshake;
    static type: number;
    static types: {
        client_hello: number;
        server_hello: number;
    };
    constructor(handshake: Handshakes);
    get type(): number;
    size(): number;
    write(binary: Binary): void;
    record(version: number): Record;
}

export { Handshake, Handshakes };
