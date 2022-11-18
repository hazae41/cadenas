'use strict';

var vector = require('../vector.cjs');

class Extension {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.class = Extension;
    }
    static from(extension) {
        const buffer = extension.export().buffer;
        const data = new vector.OpaqueVector(buffer, vector.Number16);
        return new this(extension.type, data);
    }
    size() {
        return 2 + this.data.size();
    }
    write(binary) {
        binary.writeUint16(this.type);
        this.data.write(binary);
    }
}

exports.Extension = Extension;
//# sourceMappingURL=extension.cjs.map
