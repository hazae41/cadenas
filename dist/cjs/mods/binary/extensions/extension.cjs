'use strict';

var binary = require('../../../libs/binary.cjs');

class Extension {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.class = Extension;
    }
    get blength() {
        return 2 + (2 + this.data.length);
    }
    write() {
        const binary$1 = binary.Binary.allocUnsafe(this.blength);
        binary$1.writeUint16(this.type);
        binary$1.writeUint16(this.data.length);
        binary$1.write(this.data);
        return binary$1.buffer;
    }
}

exports.Extension = Extension;
//# sourceMappingURL=extension.cjs.map
