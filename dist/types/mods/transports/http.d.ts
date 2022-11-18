import { Tls } from '../tls.js';

declare class TlsOverHttp extends Tls {
    readonly info: RequestInfo;
    readonly class: typeof TlsOverHttp;
    constructor(info: RequestInfo);
    private fetch;
    protected sendRaw(buffer: Buffer): Promise<void>;
    private onData;
}

export { TlsOverHttp };
