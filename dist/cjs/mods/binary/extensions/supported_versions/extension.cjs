'use strict';

var extension = require('../extension.cjs');
var number = require('../../number.cjs');
var vector = require('../../vector.cjs');

class ClientSupportedVersions {
    constructor(versions) {
        this.versions = versions;
        this.class = ClientSupportedVersions;
    }
    static default3() {
        const versions = new (vector.Vector16(number.Number8))([0x0304]);
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
    extension() {
        return extension.Extension.from(this);
    }
}
ClientSupportedVersions.type = 43;

exports.ClientSupportedVersions = ClientSupportedVersions;
//# sourceMappingURL=extension.cjs.map
