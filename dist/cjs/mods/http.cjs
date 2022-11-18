'use strict';

var tslib = require('tslib');
var client_hello = require('./binary/client_hello.cjs');

class TlsOverHttp {
    constructor(info) {
        this.info = info;
        this.class = TlsOverHttp;
    }
    fetch(body) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(this.info, { method: "POST", body });
            this.onData(Buffer.from(yield res.arrayBuffer()));
        });
    }
    handshake() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = new client_hello.ClientHello();
            yield this.fetch(hello.export().buffer);
        });
    }
    onData(buffer) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
        });
    }
}

exports.TlsOverHttp = TlsOverHttp;
//# sourceMappingURL=http.cjs.map
