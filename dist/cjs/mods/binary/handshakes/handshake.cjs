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
    static read(binary, length) {
        const start = binary.offset;
        const type = binary.readUint8();
        const sublength = binary.readUint24();
        if (binary.offset - start !== length - sublength)
            throw new Error(`Invalid ${this.name} length`);
        return new this(type, sublength);
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
    hello_request: 0,
    client_hello: 1,
    server_hello: 2,
    certificate: 11,
    server_key_exchange: 12,
    certificate_request: 13,
    server_hello_done: 14,
    certificate_verify: 15,
    client_key_exchange: 16,
    finished: 20,
};

exports.Handshake = Handshake;
exports.HandshakeHeader = HandshakeHeader;
//# sourceMappingURL=handshake.cjs.map
