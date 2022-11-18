'use strict';

class BufferVector {
    constructor(buffer, length) {
        this.buffer = buffer;
        this.length = length;
        this.class = (BufferVector);
    }
    static empty(length) {
        return new this(Buffer.allocUnsafe(0), length);
    }
    size() {
        return this.length.size + this.buffer.length;
    }
    write(binary) {
        new this.length(this.buffer.length).write(binary);
        binary.write(this.buffer);
    }
}
class AnyVector {
    constructor(value, length) {
        this.value = value;
        this.length = length;
        this.class = (AnyVector);
    }
    size() {
        return this.length.size + this.value.size();
    }
    write(binary) {
        new this.length(this.value.size()).write(binary);
        this.value.write(binary);
    }
}
class ArrayVector {
    constructor(array, length) {
        this.array = array;
        this.length = length;
        this.class = (ArrayVector);
    }
    size() {
        let size = this.length.size;
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
        return this.length.size + this.array.length;
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
        return this.length.size + (this.array.length * 2);
    }
    write(binary) {
        new this.length(this.array.length).write(binary);
        for (const element of this.array)
            binary.writeUint16(element);
    }
}

exports.AnyVector = AnyVector;
exports.ArrayVector = ArrayVector;
exports.BufferVector = BufferVector;
exports.Vector16 = Vector16;
exports.Vector8 = Vector8;
//# sourceMappingURL=vector.cjs.map
