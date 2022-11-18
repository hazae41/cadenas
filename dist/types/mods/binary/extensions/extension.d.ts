import { Binary } from '../../../libs/binary.js';
import { OpaqueVector, Number16 } from '../vector.js';

interface IExtension {
    type: number;
    export(): Binary;
}
declare class Extension {
    readonly type: number;
    readonly data: OpaqueVector<Number16>;
    readonly class: typeof Extension;
    constructor(type: number, data: OpaqueVector<Number16>);
    static from(extension: IExtension): Extension;
    size(): number;
    write(binary: Binary): void;
}

export { Extension, IExtension };
