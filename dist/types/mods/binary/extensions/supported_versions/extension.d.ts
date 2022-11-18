import { Binary } from '../../../../libs/binary.js';
import { Vector16, Number8 } from '../../vector.js';
import { Extension } from '../extension.js';

declare class ClientSupportedVersions {
    readonly versions: Vector16<Number8>;
    readonly class: typeof ClientSupportedVersions;
    static type: number;
    constructor(versions: Vector16<Number8>);
    static default3(): ClientSupportedVersions;
    get type(): number;
    size(): number;
    write(binary: Binary): void;
    export(): Binary;
    extension(): Extension;
}

export { ClientSupportedVersions };
