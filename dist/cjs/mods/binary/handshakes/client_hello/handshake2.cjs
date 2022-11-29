'use strict';

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
        const session_id = new (vector.SizedArrayVector(number.Number8))([]);
        const cipher_suites = new (vector.Vector16(number.Number16))(ciphers);
        const compression_methods = new (vector.Vector8(number.Number8))([0]);
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
        return handshake.Handshake.from(this);
    }
}
ClientHello2.type = handshake.Handshake.types.client_hello;

exports.ClientHello2 = ClientHello2;
//# sourceMappingURL=handshake2.cjs.map
