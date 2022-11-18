'use strict';

var tslib = require('tslib');
var tls = require('../tls.cjs');

class TlsOverHttp extends tls.Tls {
    constructor(info) {
        super();
        this.info = info;
        this.class = TlsOverHttp;
    }
    fetch(body) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(this.info, { method: "POST", body });
            this.onData(Buffer.from(yield res.arrayBuffer()));
        });
    }
    sendRaw(buffer) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            console.log("->", buffer);
            return yield this.fetch(buffer);
        });
    }
    onData(buffer) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            console.log("<-", buffer);
        });
    }
}

exports.TlsOverHttp = TlsOverHttp;
//# sourceMappingURL=http.cjs.map
