'use strict';

var random$1 = require('../../../../libs/random.cjs');
var extension = require('../../extensions/supported_versions/extension.cjs');
var handshake = require('../handshake.cjs');
var number = require('../../number.cjs');
var random = require('../../random.cjs');
var vector = require('../../vector.cjs');

class ClientHello2 {
    constructor(version, random, session_id, cipher_suites, compression_methods, extensions) {
        this.version = version;
        this.random = random;
        this.session_id = session_id;
        this.cipher_suites = cipher_suites;
        this.compression_methods = compression_methods;
        this.extensions = extensions;
        this.class = ClientHello2;
    }
    get type() {
        return this.class.type;
    }
    static default(ciphers) {
        const version = 0x0303;
        const random$1 = random.Random.default();
        const session_id = new vector.ArrayVector([], number.Number8);
        const cipher_suites = new vector.Vector16(ciphers, number.Number16);
        const compression_methods = new vector.Vector8([0], number.Number8);
        return new this(version, random$1, session_id, cipher_suites, compression_methods);
    }
    size() {
        var _a, _b;
        return 0
            + 2
            + this.random.size()
            + this.session_id.size()
            + this.cipher_suites.size()
            + this.compression_methods.size()
            + ((_b = (_a = this.extensions) === null || _a === void 0 ? void 0 : _a.size()) !== null && _b !== void 0 ? _b : 0);
    }
    write(binary) {
        var _a;
        binary.writeUint16(this.version);
        this.random.write(binary);
        this.session_id.write(binary);
        this.cipher_suites.write(binary);
        this.compression_methods.write(binary);
        (_a = this.extensions) === null || _a === void 0 ? void 0 : _a.write(binary);
    }
    handshake() {
        return new handshake.Handshake(this);
    }
}
ClientHello2.type = handshake.Handshake.types.client_hello;
class ClientHello3 {
    constructor(legacy_version, random, legacy_session_id, cipher_suites, legacy_compression_methods, extensions) {
        this.legacy_version = legacy_version;
        this.random = random;
        this.legacy_session_id = legacy_session_id;
        this.cipher_suites = cipher_suites;
        this.legacy_compression_methods = legacy_compression_methods;
        this.extensions = extensions;
        this.class = ClientHello3;
    }
    get type() {
        return this.class.type;
    }
    static default(ciphers) {
        const legacy_version = 0x0303;
        const random = random$1.generateRandom(32);
        const legacy_session_id = new vector.ArrayVector([], number.Number8);
        const cipher_suites = new vector.Vector16(ciphers, number.Number16);
        const legacy_compression_methods = new vector.Vector8([0], number.Number8);
        const extensions = new vector.ArrayVector([extension.ClientSupportedVersions.default3().extension()], number.Number16);
        return new this(legacy_version, random, legacy_session_id, cipher_suites, legacy_compression_methods, extensions);
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
ClientHello3.type = handshake.Handshake.types.client_hello;

exports.ClientHello2 = ClientHello2;
exports.ClientHello3 = ClientHello3;
//# sourceMappingURL=handshake.cjs.map
