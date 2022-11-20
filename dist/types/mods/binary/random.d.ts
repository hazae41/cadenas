import { Binary } from '../../libs/binary.js';

declare class Random {
    readonly gmt_unix_time: number;
    readonly random_bytes: Buffer;
    constructor(gmt_unix_time: number, random_bytes: Buffer);
    static default(): Random;
    size(): number;
    write(binary: Binary): void;
}

export { Random };
