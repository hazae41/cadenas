'use strict';

var tslib = require('tslib');
var binary = require('../libs/binary.cjs');
var handshake = require('./binary/handshakes/client_hello/handshake.cjs');
var record = require('./binary/record.cjs');

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
                .record(0x0304)
                .export();
            yield this.transport.send(hello.buffer);
        });
    }
    onData(data) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            console.log("<-", data);
            const binary$1 = new binary.Binary(data);
            const record$1 = record.Record.read(binary$1);
            console.log(record$1);
        });
    }
}

exports.Tls = Tls;
//# sourceMappingURL=tls.cjs.map
