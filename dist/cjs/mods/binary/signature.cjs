'use strict';

var number = require('./number.cjs');
var vector = require('./vector.cjs');

class HashAlgorithm {
    constructor(type) {
        this.type = type;
        this.class = HashAlgorithm;
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
HashAlgorithm.types = {
    none: 0,
    md5: 1,
    sha1: 2,
    sha224: 3,
    sha256: 4,
    sha384: 5,
    sha512: 6,
};
class SignatureAlgorithm {
    constructor(type) {
        this.type = type;
        this.class = SignatureAlgorithm;
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
SignatureAlgorithm.types = {
    anonymous: 0,
    rsa: 1,
    dsa: 2,
    ecdsa: 3
};
class SignatureAndHashAlgorithm {
    constructor(hash, signature) {
        this.hash = hash;
        this.signature = signature;
        this.class = SignatureAndHashAlgorithm;
    }
    size() {
        return this.hash.size() + this.signature.size();
    }
    write(binary) {
        this.hash.write(binary);
        this.signature.write(binary);
    }
    static read(binary) {
        const hash = HashAlgorithm.read(binary);
        const signature = SignatureAlgorithm.read(binary);
        return new this(hash, signature);
    }
}
class DigitallySigned {
    constructor(algorithm, signature) {
        this.algorithm = algorithm;
        this.signature = signature;
        this.class = DigitallySigned;
    }
    size() {
        return this.algorithm.size() + this.signature.size();
    }
    write(binary) {
        this.algorithm.write(binary);
        this.signature.write(binary);
    }
    static read(binary) {
        const algorithm = SignatureAndHashAlgorithm.read(binary);
        const signature = vector.BufferVector(number.Number16).read(binary);
        return new this(algorithm, signature);
    }
}

exports.DigitallySigned = DigitallySigned;
exports.HashAlgorithm = HashAlgorithm;
exports.SignatureAlgorithm = SignatureAlgorithm;
exports.SignatureAndHashAlgorithm = SignatureAndHashAlgorithm;
//# sourceMappingURL=signature.cjs.map
