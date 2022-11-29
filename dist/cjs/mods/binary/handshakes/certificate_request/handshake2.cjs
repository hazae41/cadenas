'use strict';

var handshake = require('../handshake.cjs');
var number = require('../../number.cjs');
var signature = require('../../signature.cjs');
var vector = require('../../vector.cjs');

class ClientCertificateType {
    constructor(type) {
        this.type = type;
        this.class = ClientCertificateType;
    }
    size() {
        return 1;
    }
    write(binary) {
        binary.writeUint8(this.type);
    }
    static read(binary) {
        return new this(binary.readUint8());
    }
}
ClientCertificateType.types = {
    rsa_sign: 1,
    dss_sign: 2,
    rsa_fixed_dh: 3,
    dss_fixed_dh: 4,
    rsa_ephemeral_dh_RESERVED: 5,
    dss_ephemeral_dh_RESERVED: 6,
    fortezza_dms_RESERVED: 20
};
class CertificateRequest2 {
    constructor(certificate_types, supported_signature_algorithms, certificate_authorities) {
        this.certificate_types = certificate_types;
        this.supported_signature_algorithms = supported_signature_algorithms;
        this.certificate_authorities = certificate_authorities;
        this.class = CertificateRequest2;
    }
    static read(binary, length) {
        const start = binary.offset;
        const certificate_types = vector.ArrayVector(number.Number8).read(binary, ClientCertificateType);
        const supported_signature_algorithms = vector.ArrayVector(number.Number16).read(binary, signature.SignatureAndHashAlgorithm);
        const certificate_authorities = vector.BufferVector(number.Number16).read(binary);
        if (binary.offset - start > length)
            throw new Error(`Invalid ${this.name} length`);
        return new this(certificate_types, supported_signature_algorithms, certificate_authorities);
    }
}
CertificateRequest2.type = handshake.Handshake.types.certificate_request;

exports.CertificateRequest2 = CertificateRequest2;
exports.ClientCertificateType = ClientCertificateType;
//# sourceMappingURL=handshake2.cjs.map
