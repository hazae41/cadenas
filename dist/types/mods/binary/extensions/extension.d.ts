import { Binary } from '../../../libs/binary.js';
import { Number16 } from '../number.js';
import { Vector } from '../vector.js';
import { Writable } from '../writable.js';

interface IExtension extends Writable {
    type: number;
}
declare class Extension {
    readonly type: number;
    readonly data: Vector<Number16>;
    readonly class: typeof Extension;
    constructor(type: number, data: Vector<Number16>);
    static from(extension: IExtension): Extension;
    size(): number;
    write(binary: Binary): void;
}

export { Extension, IExtension };
