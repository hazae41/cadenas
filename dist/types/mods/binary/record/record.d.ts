import { Binary } from '../../../libs/binary.js';
import { Writable } from '../writable.js';

interface IRecord extends Writable {
    type: number;
}
declare class RecordHeader {
    readonly type: number;
    readonly version: number;
    readonly length: number;
    constructor(type: number, version: number, length: number);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary): RecordHeader;
    record(fragment: Writable): Record;
}
declare class Record {
    readonly type: number;
    readonly version: number;
    readonly fragment: Writable;
    readonly class: typeof Record;
    static types: {
        invalid: number;
        change_cipher_spec: number;
        alert: number;
        handshake: number;
        application_data: number;
    };
    constructor(type: number, version: number, fragment: Writable);
    static from(record: IRecord, version: number): Record;
    size(): number;
    write(binary: Binary): void;
    header(): RecordHeader;
    export(): Binary;
}

export { IRecord, Record, RecordHeader };
