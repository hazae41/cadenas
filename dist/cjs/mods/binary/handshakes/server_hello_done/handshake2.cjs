'use strict';

var handshake = require('../handshake.cjs');

class ServerHelloDone {
    constructor() {
        this.class = ServerHelloDone;
    }
    static read(binary, length) {
        const start = binary.offset;
        /**
         * Nothing to read
         */
        if (binary.offset - start > length)
            throw new Error(`Invalid ${this.name} length`);
        return new this();
    }
}
ServerHelloDone.type = handshake.Handshake.types.server_hello_done;

exports.ServerHelloDone = ServerHelloDone;
//# sourceMappingURL=handshake2.cjs.map
