'use strict';

var handshake = require('../handshake.cjs');
var number = require('../../number.cjs');
var signature = require('../../signature.cjs');
var vector = require('../../vector.cjs');

class ServerDHParams {
    constructor(dh_p, dh_g, dh_Ys) {
        this.dh_p = dh_p;
        this.dh_g = dh_g;
        this.dh_Ys = dh_Ys;
        this.class = ServerDHParams;
    }
    static read(binary) {
        const dh_p = vector.BufferVector(number.Number16).read(binary);
        const dh_g = vector.BufferVector(number.Number16).read(binary);
        const dh_Ys = vector.BufferVector(number.Number16).read(binary);
        return new this(dh_p, dh_g, dh_Ys);
    }
}
class ServerKeyExchange2Anonymous {
    constructor(params) {
        this.params = params;
        this.class = ServerKeyExchange2Anonymous;
    }
    static read(binary, length) {
        const start = binary.offset;
        const params = ServerDHParams.read(binary);
        if (binary.offset - start !== length)
            throw new Error(`Invalid ${this.name} length`);
        return new this(params);
    }
}
ServerKeyExchange2Anonymous.type = handshake.Handshake.types.server_key_exchange;
class ServerKeyExchange2Ephemeral {
    constructor(params, signed_params) {
        this.params = params;
        this.signed_params = signed_params;
        this.class = ServerKeyExchange2Ephemeral;
    }
    static read(binary, length) {
        const start = binary.offset;
        const params = ServerDHParams.read(binary);
        const signed_params = signature.DigitallySigned.read(binary);
        if (binary.offset - start !== length)
            throw new Error(`Invalid ${this.name} length`);
        return new this(params, signed_params);
    }
}
ServerKeyExchange2Ephemeral.type = handshake.Handshake.types.server_key_exchange;
class ServerKeyExchange2 {
    constructor() {
        this.class = ServerKeyExchange2;
    }
    static read(binary, length) {
        const start = binary.offset;
        /**
         * Nothing to read
         */
        if (binary.offset - start !== length)
            throw new Error(`Invalid ${this.name} length`);
        return new this();
    }
}
ServerKeyExchange2.type = handshake.Handshake.types.server_key_exchange;

exports.ServerDHParams = ServerDHParams;
exports.ServerKeyExchange2 = ServerKeyExchange2;
exports.ServerKeyExchange2Anonymous = ServerKeyExchange2Anonymous;
exports.ServerKeyExchange2Ephemeral = ServerKeyExchange2Ephemeral;
//# sourceMappingURL=handshake2.cjs.map
