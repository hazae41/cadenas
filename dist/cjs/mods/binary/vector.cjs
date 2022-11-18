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
Number8.size = 1;
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
Number16.size = 2;
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
class Vector8 {
    constructor(array, length) {
        this.array = array;
        this.length = length;
        this.class = (Vector8);
    }
    size() {
        return new this.length(this.array.length).size() + this.array.length;
    }
    write(binary) {
        new this.length(this.array.length).write(binary);
        for (const element of this.array)
            binary.writeUint8(element);
    }
}
class Vector16 {
    constructor(array, length) {
        this.array = array;
        this.length = length;
        this.class = (Vector16);
    }
    size() {
        return new this.length(this.array.length).size() + (this.array.length * 2);
    }
    write(binary) {
        new this.length(this.array.length).write(binary);
        for (const element of this.array)
            binary.writeUint16(element);
    }
}
class OpaqueVector {
    constructor(buffer, length) {
        this.buffer = buffer;
        this.length = length;
        this.class = (OpaqueVector);
    }
    static empty(length) {
        return new this(Buffer.allocUnsafe(0), length);
    }
    size() {
        return new this.length(this.buffer.length).size() + this.buffer.length;
    }
    write(binary) {
        new this.length(this.buffer.length).write(binary);
        binary.write(this.buffer);
    }
}

exports.Number16 = Number16;
exports.Number8 = Number8;
exports.Opaque = Opaque;
exports.OpaqueVector = OpaqueVector;
exports.Vector = Vector;
exports.Vector16 = Vector16;
exports.Vector8 = Vector8;
//# sourceMappingURL=vector.cjs.map
