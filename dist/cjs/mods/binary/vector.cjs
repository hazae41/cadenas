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
class Number8 {
    constructor(length) {
        this.length = length;
        this.class = Number8;
    }
    size() {
        return 1;
    }
    write(binary) {
        binary.writeUint8(this.length);
    }
}
class Number16 {
    constructor(length) {
        this.length = length;
        this.class = Number16;
    }
    size() {
        return 2;
    }
    write(binary) {
        binary.writeUint16(this.length);
    }
}
class Vector {
    constructor(array, length) {
        this.array = array;
        this.length = length;
        this.class = (Vector);
    }
    size() {
        let size = new this.length(this.array.length).size();
        for (const element of this.array)
            size += element.size();
        return size;
    }
    write(binary) {
        new this.length(this.array.length).write(binary);
        for (const element of this.array)
            element.write(binary);
    }
}

exports.Number16 = Number16;
exports.Number8 = Number8;
exports.Opaque = Opaque;
exports.Vector = Vector;
//# sourceMappingURL=vector.cjs.map
