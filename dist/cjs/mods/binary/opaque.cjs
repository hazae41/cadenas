'use strict';

class Opaque {
    constructor(buffer) {
        this.buffer = buffer;
        this.class = Opaque;
    }
    size() {
        return this.buffer.length;
    }
    write(binary) {
        binary.write(this.buffer);
    }
}

exports.Opaque = Opaque;
//# sourceMappingURL=opaque.cjs.map
