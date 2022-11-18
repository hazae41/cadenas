'use strict';

var tslib = require('tslib');
var tls = require('../tls.cjs');

class TlsOverWebSocket extends tls.Tls {
    constructor(socket) {
        super();
        this.socket = socket;
        this.class = TlsOverWebSocket;
        socket.addEventListener("message", (e) => tslib.__awaiter(this, void 0, void 0, function* () {
            this.onData(Buffer.from(yield e.data.arrayBuffer()));
        }), { passive: true });
    }
    sendRaw(buffer) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            console.log(buffer);
            this.socket.send(buffer);
        });
    }
    onData(buffer) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            console.log(buffer);
        });
    }
}

exports.TlsOverWebSocket = TlsOverWebSocket;
//# sourceMappingURL=ws.cjs.map
