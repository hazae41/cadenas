'use strict';

var tslib = require('tslib');
var x509 = require('@peculiar/x509');
var binary = require('../libs/binary.cjs');
var alert = require('./binary/alerts/alert.cjs');
var handshake2$2 = require('./binary/handshakes/certificate/handshake2.cjs');
var handshake2$5 = require('./binary/handshakes/certificate_request/handshake2.cjs');
var handshake2 = require('./binary/handshakes/client_hello/handshake2.cjs');
var handshake = require('./binary/handshakes/handshake.cjs');
var handshake2$1 = require('./binary/handshakes/server_hello/handshake2.cjs');
var handshake2$3 = require('./binary/handshakes/server_hello_done/handshake2.cjs');
var handshake2$4 = require('./binary/handshakes/server_key_exchange/handshake2.cjs');
var record = require('./binary/record/record.cjs');

class Tls {
    constructor(transport, ciphers) {
        this.transport = transport;
        this.ciphers = ciphers;
        this.state = { type: "none" };
        this.streams = new TransformStream();
        this.buffer = Buffer.allocUnsafe(4 * 4096);
        this.wbinary = new binary.Binary(this.buffer);
        this.rbinary = new binary.Binary(this.buffer);
        this.tryRead();
        const onMessage = this.onMessage.bind(this);
        transport.addEventListener("message", onMessage, { passive: true });
        new FinalizationRegistry(() => {
            transport.removeEventListener("message", onMessage);
        }).register(this, undefined);
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
    onMessage(event) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const message = event;
            const writer = this.streams.writable.getWriter();
            writer.write(message.data).catch(console.warn);
            writer.releaseLock();
        });
    }
    tryRead() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const reader = this.streams.readable.getReader();
            try {
                yield this.read(reader);
            }
            finally {
                reader.releaseLock();
            }
        });
    }
    read(reader) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            while (true) {
                const { done, value } = yield reader.read();
                if (done)
                    break;
                this.wbinary.write(value);
                yield this.onRead();
            }
        });
    }
    onRead() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            this.rbinary.buffer = this.buffer.subarray(0, this.wbinary.offset);
            while (this.rbinary.remaining) {
                try {
                    const header = record.RecordHeader.tryRead(this.rbinary);
                    if (!header)
                        break;
                    yield this.onRecord(this.rbinary, header);
                }
                catch (e) {
                    console.error(e);
                }
            }
            if (!this.rbinary.offset)
                return;
            if (this.rbinary.offset === this.wbinary.offset) {
                this.rbinary.offset = 0;
                this.wbinary.offset = 0;
                return;
            }
            if (this.rbinary.remaining && this.wbinary.remaining < 4096) {
                console.debug(`Reallocating buffer`);
                const remaining = this.buffer.subarray(this.rbinary.offset, this.wbinary.offset);
                this.rbinary.offset = 0;
                this.wbinary.offset = 0;
                this.buffer = Buffer.allocUnsafe(4 * 4096);
                this.rbinary.buffer = this.buffer;
                this.wbinary.buffer = this.buffer;
                this.wbinary.write(remaining);
                return;
            }
        });
    }
    onRecord(binary, record) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (record.type === alert.Alert.type)
                return this.onAlert(binary, record.length);
            if (record.type === handshake.Handshake.type)
                return this.onHandshake(binary, record.length);
            binary.offset += record.length;
            console.warn(record);
        });
    }
    onAlert(binary, length) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const alert$1 = alert.Alert.read(binary, length);
            console.log(alert$1);
        });
    }
    onHandshake(binary, length) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const handshake$1 = handshake.HandshakeHeader.read(binary, length);
            if (handshake$1.type === handshake2$1.ServerHello2.type)
                return this.onServerHello(binary, handshake$1.length);
            if (handshake$1.type === handshake2$2.Certificate2.type)
                return this.onCertificate(binary, handshake$1.length);
            if (handshake$1.type === handshake2$3.ServerHelloDone2.type)
                return this.onServerHelloDone(binary, handshake$1.length);
            if (handshake$1.type === handshake2$4.ServerKeyExchange2.type)
                return this.onServerKeyExchange(binary, handshake$1.length);
            if (handshake$1.type === handshake2$5.CertificateRequest2.type)
                return this.onCertificateRequest(binary, handshake$1.length);
            binary.offset += handshake$1.length;
            console.warn(handshake$1);
        });
    }
    onServerHello(binary, length) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake2$1.ServerHello2.read(binary, length);
            console.log(hello);
            const version = hello.server_version;
            if (version !== 0x0303)
                throw new Error(`Unsupported ${version} version`);
            const cipher = this.ciphers.find(it => it.id === hello.cipher_suite);
            if (cipher === undefined)
                throw new Error(`Unsupported ${hello.cipher_suite} cipher suite`);
            this.state = { type: "ciphered", version, cipher };
        });
    }
    onCertificate(binary, length) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake2$2.Certificate2.read(binary, length);
            const certificates = hello.certificate_list.array
                .map(it => new x509.X509Certificate(it.buffer));
            console.log(certificates);
            console.log(hello);
        });
    }
    onServerKeyExchange(binary, length) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (this.state.type !== "ciphered")
                throw new Error(`Invalid state for onServerKeyExchange`);
            const hello = (() => {
                if (this.state.cipher.anonymous)
                    return handshake2$4.ServerKeyExchange2Anonymous;
                if (this.state.cipher.ephemeral)
                    return handshake2$4.ServerKeyExchange2Ephemeral;
                return handshake2$4.ServerKeyExchange2;
            })().read(binary, length);
            console.log(hello);
        });
    }
    onCertificateRequest(binary, length) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake2$5.CertificateRequest2.read(binary, length);
            console.log(hello);
        });
    }
    onServerHelloDone(binary, length) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake2$3.ServerHelloDone2.read(binary, length);
            console.log(hello);
        });
    }
}

exports.Tls = Tls;
//# sourceMappingURL=tls.cjs.map
