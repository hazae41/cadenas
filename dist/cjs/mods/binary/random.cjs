'use strict';

var random = require('../../libs/random.cjs');

class Random {
    constructor(gmt_unix_time, random_bytes) {
        this.gmt_unix_time = gmt_unix_time;
        this.random_bytes = random_bytes;
        this.class = Random;
    }
    static default() {
        const gmt_unix_time = ~~(Date.now() / 1000);
        const random_bytes = random.generateRandom(28);
        return new this(gmt_unix_time, random_bytes);
    }
    size() {
        return 4 + this.random_bytes.length;
    }
    write(binary) {
        binary.writeUint32(this.gmt_unix_time);
        binary.write(this.random_bytes);
    }
    static read(binary) {
        const gmt_unix_time = binary.readUint32();
        const random_bytes = binary.read(28);
        return new this(gmt_unix_time, random_bytes);
    }
}

exports.Random = Random;
//# sourceMappingURL=random.cjs.map
