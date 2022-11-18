import { Transport } from './transport.js';

declare class WebSocketTransport extends EventTarget implements Transport {
    readonly socket: WebSocket;
    readonly class: typeof WebSocketTransport;
    constructor(socket: WebSocket);
    send(data: Buffer): void;
}

export { WebSocketTransport };
