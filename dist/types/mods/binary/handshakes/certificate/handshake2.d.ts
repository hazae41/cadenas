import { Binary } from '../../../../libs/binary.js';
import { Number24 } from '../../number.js';
import { ArrayVector, BufferVector } from '../../vector.js';

declare class Certificate2 {
    readonly certificate_list: ArrayVector<Number24, BufferVector<Number24>>;
    readonly class: typeof Certificate2;
    static type: number;
    constructor(certificate_list: ArrayVector<Number24, BufferVector<Number24>>);
    static read(binary: Binary, length: number): Certificate2;
}

export { Certificate2 };
