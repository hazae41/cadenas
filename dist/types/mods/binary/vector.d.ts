import { Binary } from '../../libs/binary.js';

interface Writable {
    size(): number;
    write(binary: Binary): void;
}
declare class Opaque {
    readonly buffer: Buffer;
    readonly class: typeof Opaque;
    constructor(buffer: Buffer);
    size(): number;
    write(binary: Binary): void;
}
type NumberX = Number8 | Number16;
declare class Number8 {
    readonly length: number;
    readonly class: typeof Number8;
    constructor(length: number);
    size(): number;
    write(binary: Binary): void;
}
declare class Number16 {
    readonly length: number;
    readonly class: typeof Number16;
    constructor(length: number);
    size(): number;
    write(binary: Binary): void;
}
declare class Vector<T extends Writable> {
    readonly array: T[];
    readonly length: NumberX["class"];
    readonly class: {
        new (array: T[], length: NumberX["class"]): Vector<T>;
    };
    constructor(array: T[], length: NumberX["class"]);
    size(): number;
    write(binary: Binary): void;
}

export { Number16, Number8, NumberX, Opaque, Vector, Writable };
