'use strict';

var binary = require('../../../libs/binary.cjs');

class Handshake {
    constructor(handshake) {
        this.handshake = handshake;
        this.class = Handshake;
    }
    size() {
        return 1 + 3 + this.handshake.size();
    }
    write(binary) {
        binary.writeUint8(this.handshake.type);
        binary.writeUint24(this.handshake.size());
        this.handshake.write(binary);
    }
    export() {
        const binary$1 = binary.Binary.allocUnsafe(this.size());
        this.write(binary$1);
        return binary$1;
    }
}
Handshake.types = {
    client_hello: 1,
    server_hello: 2
};

exports.Handshake = Handshake;
//# sourceMappingURL=handshake.cjs.map
