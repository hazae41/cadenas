declare class TlsOverHttp {
    readonly info: RequestInfo;
    readonly class: typeof TlsOverHttp;
    constructor(info: RequestInfo);
    fetch(body?: Buffer): Promise<void>;
    handshake(): Promise<void>;
    private onData;
}

export { TlsOverHttp };
