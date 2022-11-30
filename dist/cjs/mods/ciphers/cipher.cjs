'use strict';

class CipherSuite {
    constructor(id, key_exchange, encryption, hash) {
        this.id = id;
        this.key_exchange = key_exchange;
        this.encryption = encryption;
        this.hash = hash;
    }
    get ephemeral() {
        const list = [
            "dhe_dss",
            "dhe_rsa",
            "ecdhe_ecdsa",
            "ecdhe_rsa"
        ];
        return list.includes(this.key_exchange);
    }
    get anonymous() {
        const list = [
            "dh_anon",
            "ecdh_anon"
        ];
        return list.includes(this.key_exchange);
    }
}

exports.CipherSuite = CipherSuite;
//# sourceMappingURL=cipher.cjs.map
