import { Transport } from './transports/transport.js';

declare class Tls {
    readonly transport: Transport;
    readonly ciphers: number[];
    constructor(transport: Transport, ciphers: number[]);
    handshake(): Promise<void>;
    onData(data: Buffer): Promise<void>;
}

export { Tls };
