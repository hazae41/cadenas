import { Binary } from '../../libs/binary.js';

type NumberX = Number8 | Number16;
declare class Number8 {
    readonly length: number;
    readonly class: typeof Number8;
    static size: 1;
    constructor(length: number);
    size(): 1;
    write(binary: Binary): void;
}
declare class Number16 {
    readonly length: number;
    readonly class: typeof Number16;
    static size: 2;
    constructor(length: number);
    size(): 2;
    write(binary: Binary): void;
}

export { Number16, Number8, NumberX };
