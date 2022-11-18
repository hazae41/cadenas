import { Binary } from '../../../../libs/binary.js';
import { Extension } from '../extension.js';
import { Number8 } from '../../number.js';
import { Vector } from '../../vector.js';

declare class ClientSupportedVersions {
    readonly versions: Vector<Number8>;
    readonly class: typeof ClientSupportedVersions;
    static type: number;
    constructor(versions: Vector<Number8>);
    static default3(): ClientSupportedVersions;
    get type(): number;
    size(): number;
    write(binary: Binary): void;
    extension(): Extension;
}

export { ClientSupportedVersions };
