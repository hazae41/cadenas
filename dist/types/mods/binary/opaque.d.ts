import { Binary } from '../../libs/binary.js';

declare class Opaque {
    readonly buffer: Buffer;
    readonly class: typeof Opaque;
    constructor(buffer: Buffer);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary, length: number): Opaque;
}
declare const SizedOpaque: (length: number) => {
    new (buffer: Buffer): {
        readonly class: typeof Opaque;
        readonly buffer: Buffer;
        size(): number;
        write(binary: Binary): void;
    };
    size: number;
    read(binary: Binary): {
        readonly class: typeof Opaque;
        readonly buffer: Buffer;
        size(): number;
        write(binary: Binary): void;
    };
};

export { Opaque, SizedOpaque };
