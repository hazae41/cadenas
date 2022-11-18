import { Tls } from '../tls.js';

declare class TlsOverWebSocket extends Tls {
    readonly socket: WebSocket;
    readonly class: typeof TlsOverWebSocket;
    constructor(socket: WebSocket);
    sendRaw(buffer: Buffer): Promise<void>;
    private onData;
}

export { TlsOverWebSocket };
