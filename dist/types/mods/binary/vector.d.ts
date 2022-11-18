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
    static size: 1;
    constructor(length: number);
    size(): number;
    write(binary: Binary): void;
}
declare class Number16 {
    readonly length: number;
    readonly class: typeof Number16;
    static size: 2;
    constructor(length: number);
    size(): number;
    write(binary: Binary): void;
}
declare class Vector<L extends NumberX = any, T extends Writable = any> {
    readonly array: T[];
    readonly length: L["class"];
    readonly class: {
        new (array: T[], length: L["class"]): Vector<L, T>;
    };
    constructor(array: T[], length: L["class"]);
    size(): number;
    write(binary: Binary): void;
}
declare class Vector8<L extends NumberX = any> {
    readonly array: number[];
    readonly length: L["class"];
    readonly class: {
        new (array: number[], length: L["class"]): Vector8<L>;
    };
    constructor(array: number[], length: L["class"]);
    size(): number;
    write(binary: Binary): void;
}
declare class Vector16<L extends NumberX = any> {
    readonly array: number[];
    readonly length: L["class"];
    readonly class: {
        new (array: number[], length: L["class"]): Vector16<L>;
    };
    constructor(array: number[], length: L["class"]);
    size(): number;
    write(binary: Binary): void;
}
declare class OpaqueVector<L extends NumberX = any> {
    readonly buffer: Buffer;
    readonly length: L["class"];
    readonly class: {
        new (buffer: Buffer, length: L["class"]): OpaqueVector<L>;
        empty<L_1 extends NumberX = any>(length: L_1["class"]): OpaqueVector<L_1>;
    };
    constructor(buffer: Buffer, length: L["class"]);
    static empty<L extends NumberX = any>(length: L["class"]): OpaqueVector<L>;
    size(): number;
    write(binary: Binary): void;
}

export { Number16, Number8, NumberX, Opaque, OpaqueVector, Vector, Vector16, Vector8, Writable };
