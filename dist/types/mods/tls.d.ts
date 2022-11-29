import { Transport } from './transports/transport.js';

declare class Tls {
    readonly transport: Transport;
    readonly ciphers: number[];
    readonly streams: TransformStream<Buffer, Buffer>;
    private buffer;
    private wbinary;
    private rbinary;
    constructor(transport: Transport, ciphers: number[]);
    handshake(): Promise<void>;
    private onMessage;
    private tryRead;
    private read;
    private onRead;
    private onRecord;
    private onAlert;
    private onHandshake;
    private onServerHello;
    private onServerHelloDone;
}

export { Tls };
