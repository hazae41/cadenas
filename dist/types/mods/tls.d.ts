import { Transport } from './transports/transport.js';

declare class Tls {
    readonly transport: Transport;
    readonly ciphers: number[];
    constructor(transport: Transport, ciphers: number[]);
    handshake(): Promise<void>;
    private onData;
    private onRecord;
    private onAlert;
    private onHandshake;
    private onServerHello;
}

export { Tls };
