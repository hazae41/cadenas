'use strict';

var tslib = require('tslib');
var handshake = require('./binary/handshakes/client_hello/handshake.cjs');

class Tls {
    constructor(transport) {
        this.transport = transport;
        transport.addEventListener("message", (e) => tslib.__awaiter(this, void 0, void 0, function* () {
            const message = e;
            this.onData(message.data);
        }), { passive: true });
    }
    handshake() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake.ClientHello.default3()
                .handshake()
                .record(0x0303)
                .export();
            yield this.transport.send(hello.buffer);
        });
    }
    onData(data) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            console.log("<-", data);
        });
    }
}

exports.Tls = Tls;
//# sourceMappingURL=tls.cjs.map
