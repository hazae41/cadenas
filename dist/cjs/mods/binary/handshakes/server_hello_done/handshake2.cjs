'use strict';

var handshake = require('../handshake.cjs');

class ServerHelloDone2 {
    constructor() {
        this.class = ServerHelloDone2;
    }
    static read(binary, length) {
        const start = binary.offset;
        /**
         * Nothing to read
         */
        if (binary.offset - start !== length)
            throw new Error(`Invalid ${this.name} length`);
        return new this();
    }
}
ServerHelloDone2.type = handshake.Handshake.types.server_hello_done;

exports.ServerHelloDone2 = ServerHelloDone2;
//# sourceMappingURL=handshake2.cjs.map
