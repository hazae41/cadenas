import { Binary } from '../../libs/binary.js';
import { NumberX } from './number.js';
import { Readable } from './readable.js';
import { Writable } from './writable.js';

interface Vector<L extends NumberX> extends Writable {
    readonly vlength: L["class"];
}
declare const BufferVector: <L extends NumberX>(vlength: L["class"]) => {
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
declare const AnyVector: <L extends NumberX = any>(vlength: L["class"]) => {
    new <T extends Writable = any>(value: T): {
        readonly class: any;
        readonly value: T;
        readonly vlength: L["class"];
        size(): number;
        write(binary: Binary): void;
    };
};
declare const ArrayVector: <L extends NumberX>(vlength: L["class"]) => {
    new <T extends Writable = any>(array: T[]): {
        readonly class: any;
        readonly array: T[];
        readonly vlength: L["class"];
        size(): 2 | 3 | 1;
        write(binary: Binary): void;
    };
    read<T_1 extends Writable & Readable<T_1> = any>(binary: Binary, type: T_1["class"]): {
        readonly class: any;
        readonly array: T_1[];
        readonly vlength: L["class"];
        size(): 2 | 3 | 1;
        write(binary: Binary): void;
    };
};
declare const Vector8: <L extends NumberX>(vlength: L["class"]) => {
    new (array: number[]): {
        readonly class: any;
        readonly array: number[];
        readonly vlength: L["class"];
        size(): number;
        write(binary: Binary): void;
    };
};
declare const Vector16: <L extends NumberX>(vlength: L["class"]) => {
    new (array: number[]): {
        readonly class: any;
        readonly array: number[];
        readonly vlength: L["class"];
        size(): number;
        write(binary: Binary): void;
    };
};

export { AnyVector, ArrayVector, BufferVector, Vector, Vector16, Vector8 };
