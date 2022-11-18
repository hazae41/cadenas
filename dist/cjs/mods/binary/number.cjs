'use strict';

class Number8 {
    constructor(length) {
        this.length = length;
        this.class = Number8;
    }
    size() {
        return this.class.size;
    }
    write(binary) {
        binary.writeUint8(this.length);
    }
}
Number8.size = 1;
class Number16 {
    constructor(length) {
        this.length = length;
        this.class = Number16;
    }
    size() {
        return this.class.size;
    }
    write(binary) {
        binary.writeUint16(this.length);
    }
}
Number16.size = 2;

exports.Number16 = Number16;
exports.Number8 = Number8;
//# sourceMappingURL=number.cjs.map
