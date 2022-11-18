import { Binary } from '../../libs/binary.js';

interface Writable {
    size(): number;
    write(binary: Binary): void;
}

export { Writable };
