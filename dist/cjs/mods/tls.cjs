'use strict';

var tslib = require('tslib');
var binary = require('../libs/binary.cjs');
var alert = require('./binary/alerts/alert.cjs');
var handshake = require('./binary/handshakes/client_hello/handshake.cjs');
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
    handshake2() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake.ClientHello.default2(this.ciphers)
                .handshake()
                .record(0x0301)
                .export();
            yield this.transport.send(hello.buffer);
        });
    }
    handshake3() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake.ClientHello.default3(this.ciphers)
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
            if (recordh.type === alert.Alert.type) {
                const fragment = alert.Alert.read(binary$1);
                console.log(fragment);
            }
            console.log(recordh);
        });
    }
}

exports.Tls = Tls;
//# sourceMappingURL=tls.cjs.map
