'use strict';

var tslib = require('tslib');
var binary = require('../libs/binary.cjs');
var alert = require('./binary/alerts/alert.cjs');
var handshake2 = require('./binary/handshakes/client_hello/handshake2.cjs');
var handshake = require('./binary/handshakes/handshake.cjs');
var handshake2$1 = require('./binary/handshakes/server_hello/handshake2.cjs');
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
            const hello = handshake2.ClientHello2
                .default(this.ciphers)
                .handshake()
                .record(0x0301)
                .export();
            yield this.transport.send(hello.buffer);
        });
    }
    onData(data) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            console.log("<-", data);
            this.onRecord(new binary.Binary(data));
        });
    }
    onRecord(binary) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const record$1 = record.RecordHeader.read(binary);
            if (record$1.type === alert.Alert.type)
                return this.onAlert(binary);
            if (record$1.type === handshake.Handshake.type)
                return this.onHandshake(binary);
            console.warn(record$1);
        });
    }
    onAlert(binary) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const alert$1 = alert.Alert.read(binary);
            console.log(alert$1);
        });
    }
    onHandshake(binary) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const handshake$1 = handshake.HandshakeHeader.read(binary);
            if (handshake$1.type === handshake2$1.ServerHello2.type)
                return this.onServerHello(binary, handshake$1.length);
            console.warn(handshake$1);
        });
    }
    onServerHello(binary, length) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake2$1.ServerHello2.read(binary, length);
            console.log(hello);
        });
    }
}

exports.Tls = Tls;
//# sourceMappingURL=tls.cjs.map
