import { Binary } from '../../libs/binary.js';

declare class Opaque {
    readonly buffer: Buffer;
    readonly class: typeof Opaque;
    constructor(buffer: Buffer);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary, length: number): Opaque;
}

export { Opaque };
