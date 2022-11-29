import { Binary } from '../../../../libs/binary.js';
import { Number16 } from '../../number.js';
import { DigitallySigned } from '../../signature.js';
import { Vector } from '../../vector.js';

declare class ServerDHParams {
    readonly dh_p: Vector<Number16>;
    readonly dh_g: Vector<Number16>;
    readonly dh_Ys: Vector<Number16>;
    readonly class: typeof ServerDHParams;
    constructor(dh_p: Vector<Number16>, dh_g: Vector<Number16>, dh_Ys: Vector<Number16>);
    static read(binary: Binary): ServerDHParams;
}
declare class ServerKeyExchange2DHA {
    readonly params: ServerDHParams;
    readonly class: typeof ServerKeyExchange2DHA;
    static type: number;
    constructor(params: ServerDHParams);
    static read(binary: Binary, length: number): ServerKeyExchange2DHA;
}
declare class ServerKeyExchange2DHE {
    readonly params: ServerDHParams;
    readonly signed_params: DigitallySigned;
    readonly class: typeof ServerKeyExchange2DHE;
    static type: number;
    constructor(params: ServerDHParams, signed_params: DigitallySigned);
    static read(binary: Binary, length: number): ServerKeyExchange2DHE;
}

export { ServerDHParams, ServerKeyExchange2DHA, ServerKeyExchange2DHE };
