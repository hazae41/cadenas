import { Binary } from '../../libs/binary.js';
import { NumberX } from './number.js';

interface Readable<T> {
    class: {
        read(binary: Binary): T;
    };
}
interface VlengthReadable<T, L extends NumberX = any> {
    class: {
        read(binary: Binary, vlength: L["class"]): T;
    };
}

export { Readable, VlengthReadable };
