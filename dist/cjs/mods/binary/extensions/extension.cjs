'use strict';

var number = require('../number.cjs');
var vector = require('../vector.cjs');

class Extension {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.class = Extension;
    }
    static from(extension) {
        const data = new (vector.AnyVector(number.Number16))(extension);
        return new this(extension.type, data);
    }
    size() {
        return 2 + this.data.size();
    }
    write(binary) {
        binary.writeUint16(this.type);
        this.data.write(binary);
    }
    static read(binary) {
        throw new Error(`Unimplemented`);
    }
}

exports.Extension = Extension;
//# sourceMappingURL=extension.cjs.map
