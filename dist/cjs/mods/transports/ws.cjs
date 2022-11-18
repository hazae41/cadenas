'use strict';

var tslib = require('tslib');

class WebSocketTransport extends EventTarget {
    constructor(socket) {
        super();
        this.socket = socket;
        this.class = WebSocketTransport;
        socket.addEventListener("message", (e) => tslib.__awaiter(this, void 0, void 0, function* () {
            const data = Buffer.from(yield e.data.arrayBuffer());
            this.dispatchEvent(new MessageEvent("message", { data }));
        }), { passive: true });
    }
    send(data) {
        console.log("->", data);
        this.socket.send(data);
    }
}

exports.WebSocketTransport = WebSocketTransport;
//# sourceMappingURL=ws.cjs.map
