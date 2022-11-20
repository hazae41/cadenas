'use strict';

var tslib = require('tslib');
var binary = require('../libs/binary.cjs');
var alert = require('./binary/alerts/alert.cjs');
var handshake2 = require('./binary/handshakes/client_hello/handshake2.cjs');
var handshake = require('./binary/handshakes/handshake.cjs');
var record = require('./binary/record/record.cjs');

class Tls {
    constructor(transport, ciphers) {
        this.transport = transport;
        this.ciphers = ciphers;
        transport.addEventListener("message", (e) => tslib.__awaiter(this, void 0, void 0, function* () {
            const message = e;
            this.onData(message.data);
        }), { passive: true });
    }
    handshake() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake2.ClientHello2.default(this.ciphers)
                .handshake()
                .record(0x0301)
                .export();
            yield this.transport.send(hello.buffer);
        });
    }
    onData(data) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            console.log("<-", data);
            const binary$1 = new binary.Binary(data);
            const recordh = record.RecordHeader.read(binary$1);
            console.log(recordh);
            if (recordh.type === alert.Alert.type) {
                const fragment = alert.Alert.read(binary$1);
                console.log(fragment);
            }
            if (recordh.type === handshake.Handshake.type) {
                const handshakeh = handshake.HandshakeHeader.read(binary$1);
                console.log(handshakeh);
            }
        });
    }
}

exports.Tls = Tls;
//# sourceMappingURL=tls.cjs.map
