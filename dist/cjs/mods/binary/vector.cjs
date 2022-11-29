'use strict';

const BufferVector = (vlength) => class {
    constructor(buffer) {
        this.buffer = buffer;
        this.class = BufferVector(vlength);
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
const AnyVector = (vlength) => class {
    constructor(value) {
        this.value = value;
        this.class = AnyVector(vlength);
    }
    get vlength() {
        return vlength;
    }
    size() {
        return vlength.size + this.value.size();
    }
    write(binary) {
        new vlength(this.value.size()).write(binary);
        this.value.write(binary);
    }
};
const ArrayVector = (vlength) => class {
    constructor(array) {
        this.array = array;
        this.class = ArrayVector(vlength);
    }
    get vlength() {
        return vlength;
    }
    size() {
        let size = vlength.size;
        for (const element of this.array)
            size += element.size();
        return size;
    }
    write(binary) {
        let size = 0;
        for (const element of this.array)
            size += element.size();
        new vlength(size).write(binary);
        for (const element of this.array)
            element.write(binary);
    }
    static read(binary, type) {
        const start = binary.offset;
        const length = vlength.read(binary).value;
        const array = new Array();
        while (binary.offset - start < length)
            array.push(type.read(binary));
        return new this(array);
    }
};
const Vector8 = (vlength) => class {
    constructor(array) {
        this.array = array;
        this.class = Vector8(vlength);
    }
    get vlength() {
        return vlength;
    }
    size() {
        return vlength.size + this.array.length;
    }
    write(binary) {
        new vlength(this.array.length).write(binary);
        for (const element of this.array)
            binary.writeUint8(element);
    }
};
const Vector16 = (vlength) => class {
    constructor(array) {
        this.array = array;
        this.class = Vector16(vlength);
    }
    get vlength() {
        return vlength;
    }
    size() {
        return vlength.size + (this.array.length * 2);
    }
    write(binary) {
        new vlength(this.array.length * 2).write(binary);
        for (const element of this.array)
            binary.writeUint16(element);
    }
};

exports.AnyVector = AnyVector;
exports.ArrayVector = ArrayVector;
exports.BufferVector = BufferVector;
exports.Vector16 = Vector16;
exports.Vector8 = Vector8;
//# sourceMappingURL=vector.cjs.map
