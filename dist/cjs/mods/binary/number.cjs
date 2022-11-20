'use strict';

class Number8 {
    constructor(value) {
        this.value = value;
        this.class = Number8;
    }
    size() {
        return this.class.size;
    }
    write(binary) {
        binary.writeUint8(this.value);
    }
    static read(binary) {
        return new this(binary.readUint8());
    }
}
Number8.size = 1;
class Number16 {
    constructor(value) {
        this.value = value;
        this.class = Number16;
    }
    size() {
        return this.class.size;
    }
    write(binary) {
        binary.writeUint16(this.value);
    }
    static read(binary) {
        return new this(binary.readUint16());
    }
}
Number16.size = 2;

exports.Number16 = Number16;
exports.Number8 = Number8;
//# sourceMappingURL=number.cjs.map
