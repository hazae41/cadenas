'use strict';

var tslib = require('tslib');
var handshake = require('./binary/handshakes/client_hello/handshake.cjs');

class Tls {
    handshake() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake.ClientHello.default3()
                .handshake()
                .record(0x0303)
                .export();
            yield this.sendRaw(hello.buffer);
        });
    }
}

exports.Tls = Tls;
//# sourceMappingURL=tls.cjs.map
