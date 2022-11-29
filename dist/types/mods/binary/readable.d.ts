import { Binary } from '../../libs/binary.js';

interface Readable<T> {
    class: {
        read(binary: Binary): T;
    };
}
interface ReadableChecked<T> {
    class: {
        read(binary: Binary, length: number): T;
    };
}

export { Readable, ReadableChecked };
