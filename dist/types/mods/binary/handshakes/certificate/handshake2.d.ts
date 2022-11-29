import { Binary } from '../../../../libs/binary.js';
import { Number24 } from '../../number.js';
import { Vector } from '../../vector.js';

declare class Certificate2 {
    readonly certificate_list: Vector<Number24>;
    readonly class: typeof Certificate2;
    static type: number;
    constructor(certificate_list: Vector<Number24>);
    static read(binary: Binary, length: number): Certificate2;
}

export { Certificate2 };
