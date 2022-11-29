'use strict';

const SizedBufferVector = (vlength) => class {
    constructor(buffer) {
        this.buffer = buffer;
        this.class = SizedBufferVector(vlength);
    }
    get vlength() {
        return vlength;
    }
    static empty() {
        return new this(Buffer.allocUnsafe(0));
    }
    size() {
        return vlength.size + this.buffer.length;
    }
    write(binary) {
        new vlength(this.buffer.length).write(binary);
        binary.write(this.buffer);
    }
    static read(binary) {
        const length = vlength.read(binary).value;
        const buffer = binary.read(length);
        return new this(buffer);
    }
};
class BufferVector {
    constructor(buffer, vlength) {
        this.buffer = buffer;
        this.vlength = vlength;
        this.class = (BufferVector);
    }
    static empty(length) {
        return new this(Buffer.allocUnsafe(0), length);
    }
    size() {
        return this.vlength.size + this.buffer.length;
    }
    write(binary) {
        new this.vlength(this.buffer.length).write(binary);
        binary.write(this.buffer);
    }
    static read(binary, vlength) {
        const length = vlength.read(binary).value;
        const buffer = binary.read(length);
        return new this(buffer, vlength);
    }
}
class AnyVector {
    constructor(value, vlength) {
        this.value = value;
        this.vlength = vlength;
        this.class = (AnyVector);
    }
    size() {
        return this.vlength.size + this.value.size();
    }
    write(binary) {
        new this.vlength(this.value.size()).write(binary);
        this.value.write(binary);
    }
}
class ArrayVector {
    constructor(array, vlength) {
        this.array = array;
        this.vlength = vlength;
        this.class = (ArrayVector);
    }
    size() {
        let size = this.vlength.size;
        for (const element of this.array)
            size += element.size();
        return size;
    }
    write(binary) {
        let size = 0;
        for (const element of this.array)
            size += element.size();
        new this.vlength(size).write(binary);
        for (const element of this.array)
            element.write(binary);
    }
    static read(binary, vlength, type) {
        const start = binary.offset;
        const length = vlength.read(binary).value;
        const array = new Array();
        while (binary.offset - start < length)
            array.push(type.read(binary));
        return new this(array, vlength);
    }
}
class Vector8 {
    constructor(array, vlength) {
        this.array = array;
        this.vlength = vlength;
        this.class = (Vector8);
    }
    size() {
        return this.vlength.size + this.array.length;
    }
    write(binary) {
        new this.vlength(this.array.length).write(binary);
        for (const element of this.array)
            binary.writeUint8(element);
    }
}
class Vector16 {
    constructor(array, vlength) {
        this.array = array;
        this.vlength = vlength;
        this.class = (Vector16);
    }
    size() {
        return this.vlength.size + (this.array.length * 2);
    }
    write(binary) {
        new this.vlength(this.array.length * 2).write(binary);
        for (const element of this.array)
            binary.writeUint16(element);
    }
}

exports.AnyVector = AnyVector;
exports.ArrayVector = ArrayVector;
exports.BufferVector = BufferVector;
exports.SizedBufferVector = SizedBufferVector;
exports.Vector16 = Vector16;
exports.Vector8 = Vector8;
//# sourceMappingURL=vector.cjs.map
