import { Binary } from '../../../../libs/binary.js';

declare class ServerHelloDone2 {
    readonly class: typeof ServerHelloDone2;
    static type: number;
    constructor();
    static read(binary: Binary, length: number): ServerHelloDone2;
}

export { ServerHelloDone2 };
