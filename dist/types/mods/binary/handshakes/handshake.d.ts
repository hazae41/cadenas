import { Binary } from '../../../libs/binary.js';
import { Record } from '../record/record.js';
import { Writable } from '../writable.js';

interface IHandshake extends Writable {
    type: number;
}
declare class Handshake {
    readonly handshake: IHandshake;
    readonly class: typeof Handshake;
    static type: number;
    static types: {
        client_hello: number;
        server_hello: number;
    };
    constructor(handshake: IHandshake);
    get type(): number;
    size(): number;
    write(binary: Binary): void;
    record(version: number): Record;
}

export { Handshake, IHandshake };
