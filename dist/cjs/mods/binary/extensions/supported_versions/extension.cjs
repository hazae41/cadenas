'use strict';

var binary = require('../../../../libs/binary.cjs');

class ClientSupportedVersions {
    constructor(versions) {
        this.versions = versions;
    }
    get blength() {
        return (1 + (this.versions.length * 2));
    }
    write() {
        const binary$1 = binary.Binary.allocUnsafe(this.blength);
        binary$1.writeUint8(this.versions.length);
        for (const version of this.versions)
            binary$1.writeUint16(version);
        return binary$1.buffer;
    }
}

exports.ClientSupportedVersions = ClientSupportedVersions;
//# sourceMappingURL=extension.cjs.map
