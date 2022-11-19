'use strict';

var binary = require('../../../libs/binary.cjs');

class RecordHeader {
    constructor(type, version, length) {
        this.type = type;
        this.version = version;
        this.length = length;
    }
    size() {
        return 1 + 2 + 2;
    }
    write(binary) {
        binary.writeUint8(this.type);
        binary.writeUint16(this.version);
        binary.writeUint16(this.length);
    }
    static read(binary) {
        const type = binary.readUint8();
        const version = binary.readUint16();
        const length = binary.readUint16();
        return new this(type, version, length);
    }
    record(fragment) {
        return new Record(this.type, this.version, fragment);
    }
}
class Record {
    constructor(type, version, fragment) {
        this.type = type;
        this.version = version;
        this.fragment = fragment;
        this.class = Record;
    }
    static from(record, version) {
        return new this(record.type, version, record);
    }
    size() {
        return this.header().size() + this.fragment.size();
    }
    write(binary) {
        this.header().write(binary);
        this.fragment.write(binary);
    }
    header() {
        return new RecordHeader(this.type, this.version, this.fragment.size());
    }
    export() {
        const binary$1 = binary.Binary.allocUnsafe(this.size());
        this.write(binary$1);
        return binary$1;
    }
}
Record.types = {
    invalid: 0,
    change_cipher_spec: 20,
    alert: 21,
    handshake: 22,
    application_data: 23
};

exports.Record = Record;
exports.RecordHeader = RecordHeader;
//# sourceMappingURL=record.cjs.map
