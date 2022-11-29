import { Binary } from '../../../libs/binary.js';
import { Record } from '../record/record.js';
import { Writable } from '../writable.js';

interface IHandshake extends Writable {
    type: number;
}
declare class HandshakeHeader {
    readonly type: number;
    readonly length: number;
    constructor(type: number, length: number);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary, length: number): HandshakeHeader;
}
declare class Handshake {
    readonly subtype: number;
    readonly fragment: Writable;
    readonly class: typeof Handshake;
    static type: number;
    static types: {
        hello_request: number;
        client_hello: number;
        server_hello: number;
        certificate: number;
        server_key_exchange: number;
        certificate_request: number;
        server_hello_done: number;
        certificate_verify: number;
        client_key_exchange: number;
        finished: number;
    };
    constructor(subtype: number, fragment: Writable);
    get type(): number;
    static from(handshake: IHandshake): Handshake;
    size(): number;
    write(binary: Binary): void;
    record(version: number): Record;
}

export { Handshake, HandshakeHeader, IHandshake };
