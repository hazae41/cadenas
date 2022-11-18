'use strict';

var binary = require('../../libs/binary.cjs');
var random = require('../../libs/random.cjs');
var vector = require('./vector.cjs');

class ClientHello {
    constructor(legacy_version = 0x0303, random$1 = random.generateRandom(32), legacy_session_id = new vector.Vector([], vector.Number8), cipher_suites = new vector.Vector([new vector.Number16(0xC02F), new vector.Number16(0xC02F)], vector.Number16), legacy_compression_methods = new vector.Vector([new vector.Number8(0)], vector.Number8), extensions = new vector.Vector([], vector.Number16)) {
        this.legacy_version = legacy_version;
        this.random = random$1;
        this.legacy_session_id = legacy_session_id;
        this.cipher_suites = cipher_suites;
        this.legacy_compression_methods = legacy_compression_methods;
        this.extensions = extensions;
        this.class = ClientHello;
    }
    size() {
        return 0
            + 2
            + this.random.length
            + this.legacy_session_id.size()
            + this.cipher_suites.size()
            + this.legacy_compression_methods.size()
            + this.extensions.size();
    }
    write(binary) {
        binary.writeUint16(this.legacy_version);
        binary.write(this.random);
        this.legacy_session_id.write(binary);
        this.cipher_suites.write(binary);
        this.legacy_compression_methods.write(binary);
        this.extensions.write(binary);
    }
    export() {
        const binary$1 = binary.Binary.allocUnsafe(this.size());
        this.write(binary$1);
        return binary$1;
    }
}

exports.ClientHello = ClientHello;
//# sourceMappingURL=client_hello.cjs.map
