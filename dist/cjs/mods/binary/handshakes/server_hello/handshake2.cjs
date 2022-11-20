'use strict';

var number = require('../../number.cjs');
var random = require('../../random.cjs');
var vector = require('../../vector.cjs');
var handshake = require('../handshake.cjs');

class ServerHello2 {
    constructor(server_version, random, session_id, cipher_suite, compression_methods, extensions) {
        this.server_version = server_version;
        this.random = random;
        this.session_id = session_id;
        this.cipher_suite = cipher_suite;
        this.compression_methods = compression_methods;
        this.extensions = extensions;
        this.class = ServerHello2;
    }
    static read(binary, length) {
        const start = binary.offset;
        const server_version = binary.readUint16();
        const random$1 = random.Random.read(binary);
        const session_id = vector.BufferVector.read(binary, number.Number8);
        const cipher_suite = binary.readUint16();
        const compression_methods = vector.BufferVector.read(binary, number.Number8);
        if (binary.offset - start > length)
            throw new Error(`Invalid ${this.name} length`);
        const extensions = binary.offset - start < length
            ? vector.BufferVector.read(binary, number.Number16)
            : undefined;
        return new this(server_version, random$1, session_id, cipher_suite, compression_methods, extensions);
    }
}
ServerHello2.type = handshake.Handshake.types.server_hello;

exports.ServerHello2 = ServerHello2;
//# sourceMappingURL=handshake2.cjs.map
