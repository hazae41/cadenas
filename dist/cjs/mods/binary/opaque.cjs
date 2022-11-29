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
    static read(binary, length) {
        const buffer = binary.read(length);
        return new this(buffer);
    }
}
const SizedOpaque = (length) => { var _a; return _a = class {
        constructor(buffer) {
            this.buffer = buffer;
            this.class = Opaque;
        }
        size() {
            return length;
        }
        write(binary) {
            binary.write(this.buffer);
        }
        static read(binary) {
            const buffer = binary.read(length);
            return new this(buffer);
        }
    },
    _a.size = length,
    _a; };

exports.Opaque = Opaque;
exports.SizedOpaque = SizedOpaque;
//# sourceMappingURL=opaque.cjs.map
