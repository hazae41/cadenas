'use strict';

var binary = require('../../libs/binary.cjs');

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
        return 1 + 2 + 2 + this.fragment.size();
    }
    write(binary) {
        binary.writeUint8(this.type);
        binary.writeUint16(this.version);
        binary.writeUint16(this.fragment.size());
        this.fragment.write(binary);
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
//# sourceMappingURL=record.cjs.map
