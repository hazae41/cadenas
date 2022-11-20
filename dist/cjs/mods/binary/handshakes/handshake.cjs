'use strict';

var record = require('../record/record.cjs');

class HandshakeHeader {
    constructor(type, length) {
        this.type = type;
        this.length = length;
    }
    size() {
        return 1 + 3;
    }
    write(binary) {
        binary.writeUint8(this.type);
        binary.writeUint24(this.length);
    }
    static read(binary) {
        const type = binary.readUint8();
        const length = binary.readUint24();
        return new this(type, length);
    }
}
class Handshake {
    constructor(subtype, fragment) {
        this.subtype = subtype;
        this.fragment = fragment;
        this.class = Handshake;
    }
    get type() {
        return this.class.type;
    }
    static from(handshake) {
        return new this(handshake.type, handshake);
    }
    size() {
        return 1 + 3 + this.fragment.size();
    }
    write(binary) {
        binary.writeUint8(this.subtype);
        binary.writeUint24(this.fragment.size());
        this.fragment.write(binary);
    }
    record(version) {
        return record.Record.from(this, version);
    }
}
Handshake.type = record.Record.types.handshake;
Handshake.types = {
    client_hello: 1,
    server_hello: 2
};

exports.Handshake = Handshake;
exports.HandshakeHeader = HandshakeHeader;
//# sourceMappingURL=handshake.cjs.map
