declare abstract class Tls {
    protected abstract sendRaw(buffer: Buffer): Promise<void>;
    handshake(): Promise<void>;
}

export { Tls };
