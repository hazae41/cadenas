import { CipherSuite } from './ciphers/cipher.js';
import { Transport } from './transports/transport.js';

type State = NoneState | CipheredState;
interface NoneState {
    type: "none";
}
interface CipheredState {
    type: "ciphered";
    version: number;
    cipher: CipherSuite;
}
declare class Tls {
    readonly transport: Transport;
    readonly ciphers: CipherSuite[];
    private state;
    readonly streams: TransformStream<Buffer, Buffer>;
    private buffer;
    private wbinary;
    private rbinary;
    constructor(transport: Transport, ciphers: CipherSuite[]);
    handshake(): Promise<void>;
    private onMessage;
    private tryRead;
    private read;
    private onRead;
    private onRecord;
    private onAlert;
    private onHandshake;
    private onServerHello;
    private onCertificate;
    private onServerKeyExchange;
    private onCertificateRequest;
    private onServerHelloDone;
}

export { CipheredState, NoneState, State, Tls };
