import { Binary } from '../../libs/binary.js';
import { NumberX } from './number.js';
import { Readable } from './readable.js';
import { Writable } from './writable.js';

interface Vector<L extends NumberX = any> extends Writable {
    readonly vlength: L["class"];
}
declare const SizedBufferVector: <L extends NumberX = any>(vlength: L["class"]) => {
    new (buffer: Buffer): {
        readonly class: any;
        readonly buffer: Buffer;
        readonly vlength: L["class"];
        size(): number;
        write(binary: Binary): void;
    };
    empty(): {
        readonly class: any;
        readonly buffer: Buffer;
        readonly vlength: L["class"];
        size(): number;
        write(binary: Binary): void;
    };
    read(binary: Binary): {
        readonly class: any;
        readonly buffer: Buffer;
        readonly vlength: L["class"];
        size(): number;
        write(binary: Binary): void;
    };
};
declare class BufferVector<L extends NumberX = any> {
    readonly buffer: Buffer;
    readonly vlength: L["class"];
    readonly class: {
        new (buffer: Buffer, vlength: L["class"]): BufferVector<L>;
        empty<L_1 extends NumberX = any>(length: L_1["class"]): BufferVector<L_1>;
        read<L_2 extends NumberX = any>(binary: Binary, vlength: L_2["class"]): BufferVector<L_2>;
    };
    constructor(buffer: Buffer, vlength: L["class"]);
    static empty<L extends NumberX = any>(length: L["class"]): BufferVector<L>;
    size(): number;
    write(binary: Binary): void;
    static read<L extends NumberX = any>(binary: Binary, vlength: L["class"]): BufferVector<L>;
}
declare class AnyVector<L extends NumberX = any, T extends Writable = any> {
    readonly value: T;
    readonly vlength: L["class"];
    readonly class: {
        new (value: any, vlength: L["class"]): AnyVector<L, any>;
    };
    constructor(value: T, vlength: L["class"]);
    size(): number;
    write(binary: Binary): void;
}
declare class ArrayVector<L extends NumberX = any, T extends Writable = any> {
    readonly array: T[];
    readonly vlength: L["class"];
    readonly class: {
        new (array: T[], vlength: L["class"]): ArrayVector<L, T>;
        read<L_1 extends NumberX = any, T_1 extends Writable & Readable<T_1> = any>(binary: Binary, vlength: L_1["class"], type: T_1["class"]): ArrayVector<L_1, T_1>;
    };
    constructor(array: T[], vlength: L["class"]);
    size(): 2 | 3 | 1;
    write(binary: Binary): void;
    static read<L extends NumberX = any, T extends Writable & Readable<T> = any>(binary: Binary, vlength: L["class"], type: T["class"]): ArrayVector<L, T>;
}
declare class Vector8<L extends NumberX = any> {
    readonly array: number[];
    readonly vlength: L["class"];
    readonly class: {
        new (array: number[], vlength: L["class"]): Vector8<L>;
    };
    constructor(array: number[], vlength: L["class"]);
    size(): number;
    write(binary: Binary): void;
}
declare class Vector16<L extends NumberX = any> {
    readonly array: number[];
    readonly vlength: L["class"];
    readonly class: {
        new (array: number[], vlength: L["class"]): Vector16<L>;
    };
    constructor(array: number[], vlength: L["class"]);
    size(): number;
    write(binary: Binary): void;
}

export { AnyVector, ArrayVector, BufferVector, SizedBufferVector, Vector, Vector16, Vector8 };
