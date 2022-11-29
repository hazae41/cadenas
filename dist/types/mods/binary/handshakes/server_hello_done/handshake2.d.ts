import { Binary } from '../../../../libs/binary.js';

declare class ServerHelloDone {
    readonly class: typeof ServerHelloDone;
    static type: number;
    constructor();
    static read(binary: Binary, length: number): ServerHelloDone;
}

export { ServerHelloDone };
