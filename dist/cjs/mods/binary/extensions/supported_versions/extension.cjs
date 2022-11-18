'use strict';

var binary = require('../../../../libs/binary.cjs');
var vector = require('../../vector.cjs');
var extension = require('../extension.cjs');

class ClientSupportedVersions {
    constructor(versions) {
        this.versions = versions;
        this.class = ClientSupportedVersions;
    }
    static default3() {
        const versions = new vector.Vector16([0x0304], vector.Number8);
        return new this(versions);
    }
    get type() {
        return this.class.type;
    }
    size() {
        return this.versions.size();
    }
    write(binary) {
        this.versions.write(binary);
    }
    export() {
        const binary$1 = binary.Binary.allocUnsafe(this.size());
        this.write(binary$1);
        return binary$1;
    }
    extension() {
        return extension.Extension.from(this);
    }
}
ClientSupportedVersions.type = 43;

exports.ClientSupportedVersions = ClientSupportedVersions;
//# sourceMappingURL=extension.cjs.map
