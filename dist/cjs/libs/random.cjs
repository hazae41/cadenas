'use strict';

function generateRandom(length) {
    const buffer = Buffer.allocUnsafe(length);
    crypto.getRandomValues(buffer);
    return buffer;
}

exports.generateRandom = generateRandom;
//# sourceMappingURL=random.cjs.map
