import { Promisable } from '../../libs/promisable.js';

interface Transport extends EventTarget {
    send(buffer: Buffer): Promisable<void>;
}

export { Transport };
