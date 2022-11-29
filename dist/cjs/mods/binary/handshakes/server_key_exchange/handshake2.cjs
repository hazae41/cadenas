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
class ServerKeyExchange2DHA {
    constructor(params) {
        this.params = params;
        this.class = ServerKeyExchange2DHA;
    }
    static read(binary, length) {
        const start = binary.offset;
        const params = ServerDHParams.read(binary);
        if (binary.offset - start > length)
            throw new Error(`Invalid ${this.name} length`);
        return new this(params);
    }
}
ServerKeyExchange2DHA.type = handshake.Handshake.types.server_key_exchange;
class ServerKeyExchange2DHE {
    constructor(params, signed_params) {
        this.params = params;
        this.signed_params = signed_params;
        this.class = ServerKeyExchange2DHE;
    }
    static read(binary, length) {
        const start = binary.offset;
        const params = ServerDHParams.read(binary);
        const signed_params = signature.DigitallySigned.read(binary);
        if (binary.offset - start > length)
            throw new Error(`Invalid ${this.name} length`);
        return new this(params, signed_params);
    }
}
ServerKeyExchange2DHE.type = handshake.Handshake.types.server_key_exchange;

exports.ServerDHParams = ServerDHParams;
exports.ServerKeyExchange2DHA = ServerKeyExchange2DHA;
exports.ServerKeyExchange2DHE = ServerKeyExchange2DHE;
//# sourceMappingURL=handshake2.cjs.map
