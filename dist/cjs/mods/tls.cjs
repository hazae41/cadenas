'use strict';

var tslib = require('tslib');
var handshake = require('./binary/handshakes/client_hello/handshake.cjs');

class Tls {
    handshake() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const hello = handshake.ClientHello.default3();
            yield this.sendRaw(hello.handshake().export().buffer);
        });
    }
}

exports.Tls = Tls;
//# sourceMappingURL=tls.cjs.map
