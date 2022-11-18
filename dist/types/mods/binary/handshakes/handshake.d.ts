import { Binary } from '../../../libs/binary.js';
import { ClientHello } from './client_hello/handshake.js';

type Handshakes = ClientHello;
declare class Handshake {
    readonly handshake: Handshakes;
    readonly class: typeof Handshake;
    static types: {
        client_hello: number;
        server_hello: number;
    };
    constructor(handshake: Handshakes);
    size(): number;
    write(binary: Binary): void;
    export(): Binary;
}

export { Handshake, Handshakes };
