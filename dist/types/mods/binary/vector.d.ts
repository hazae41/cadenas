import { Binary } from '../../libs/binary.js';
import { NumberX } from './number.js';
import { Writable } from './writable.js';

interface Vector<L extends NumberX = any> extends Writable {
    readonly length: L["class"];
}
declare class BufferVector<L extends NumberX = any> {
    readonly buffer: Buffer;
    readonly length: L["class"];
    readonly class: {
        new (buffer: Buffer, length: L["class"]): BufferVector<L>;
        empty<L_1 extends NumberX = any>(length: L_1["class"]): BufferVector<L_1>;
    };
    constructor(buffer: Buffer, length: L["class"]);
    static empty<L extends NumberX = any>(length: L["class"]): BufferVector<L>;
    size(): number;
    write(binary: Binary): void;
}
declare class AnyVector<L extends NumberX = any, T extends Writable = any> {
    readonly value: T;
    readonly length: L["class"];
    readonly class: {
        new (value: any, length: L["class"]): AnyVector<L, any>;
    };
    constructor(value: T, length: L["class"]);
    size(): number;
    write(binary: Binary): void;
}
declare class ArrayVector<L extends NumberX = any, T extends Writable = any> {
    readonly array: T[];
    readonly length: L["class"];
    readonly class: {
        new (array: T[], length: L["class"]): ArrayVector<L, T>;
    };
    constructor(array: T[], length: L["class"]);
    size(): 2 | 1;
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

export { AnyVector, ArrayVector, BufferVector, Vector, Vector16, Vector8 };
