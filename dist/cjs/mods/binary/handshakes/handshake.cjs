'use strict';

var record = require('../record.cjs');

class Handshake {
    constructor(handshake) {
        this.handshake = handshake;
        this.class = Handshake;
    }
    get type() {
        return this.class.type;
    }
    size() {
        return 1 + 3 + this.handshake.size();
    }
    write(binary) {
        binary.writeUint8(this.handshake.type);
        binary.writeUint24(this.handshake.size());
        this.handshake.write(binary);
    }
    record(version) {
        return record.Record.from(this, version);
    }
}
Handshake.type = record.Record.types.handshake;
Handshake.types = {
    client_hello: 1,
    server_hello: 2
};

exports.Handshake = Handshake;
//# sourceMappingURL=handshake.cjs.map
