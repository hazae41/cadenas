import { Transport } from './transports/transport.js';

declare abstract class Tls {
    readonly transport: Transport;
    constructor(transport: Transport);
    handshake(): Promise<void>;
    onData(data: Buffer): Promise<void>;
}

export { Tls };
