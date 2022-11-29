'use strict';

var handshake = require('../handshake.cjs');
var number = require('../../number.cjs');
var vector = require('../../vector.cjs');

class Certificate2 {
    constructor(certificate_list) {
        this.certificate_list = certificate_list;
        this.class = Certificate2;
    }
    static read(binary, length) {
        const start = binary.offset;
        const certificate_list = vector.ArrayVector(number.Number24).read(binary, vector.BufferVector(number.Number24));
        if (binary.offset - start > length)
            throw new Error(`Invalid ${this.name} length`);
        return new this(certificate_list);
    }
}
Certificate2.type = handshake.Handshake.types.certificate;

exports.Certificate2 = Certificate2;
//# sourceMappingURL=handshake2.cjs.map
