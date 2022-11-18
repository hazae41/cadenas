'use strict';

var binary = require('../../libs/binary.cjs');
var alert = require('./alerts/alert.cjs');
var opaque = require('./opaque.cjs');

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
    static read(binary) {
        const type = binary.readUint8();
        const version = binary.readUint16();
        const length = binary.readUint16();
        let fragment;
        if (type === alert.Alert.type) {
            fragment = alert.Alert.read(binary);
        }
        else {
            fragment = opaque.Opaque.read(binary, length);
        }
        return new this(type, version, fragment);
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
