'use strict';

var random = require('../../../../libs/random.cjs');
var extension = require('../../extensions/supported_versions/extension.cjs');
var handshake = require('../handshake.cjs');
var number = require('../../number.cjs');
var vector = require('../../vector.cjs');

class ClientHello {
    constructor(legacy_version, random, legacy_session_id, cipher_suites, legacy_compression_methods, extensions) {
        this.legacy_version = legacy_version;
        this.random = random;
        this.legacy_session_id = legacy_session_id;
        this.cipher_suites = cipher_suites;
        this.legacy_compression_methods = legacy_compression_methods;
        this.extensions = extensions;
        this.class = ClientHello;
    }
    get type() {
        return this.class.type;
    }
    static default3() {
        const legacy_version = 0x0303;
        const random$1 = random.generateRandom(32);
        const legacy_session_id = new vector.ArrayVector([], number.Number8);
        const cipher_suites = new vector.Vector16([0xC02F, 0xC02F], number.Number16);
        const legacy_compression_methods = new vector.Vector8([0], number.Number8);
        const extensions = new vector.ArrayVector([extension.ClientSupportedVersions.default3().extension()], number.Number16);
        return new this(legacy_version, random$1, legacy_session_id, cipher_suites, legacy_compression_methods, extensions);
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
    handshake() {
        return new handshake.Handshake(this);
    }
}
ClientHello.type = handshake.Handshake.types.client_hello;

exports.ClientHello = ClientHello;
//# sourceMappingURL=handshake.cjs.map
