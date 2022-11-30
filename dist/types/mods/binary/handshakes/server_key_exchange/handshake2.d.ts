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
declare class ServerKeyExchange2Anonymous {
    readonly params: ServerDHParams;
    readonly class: typeof ServerKeyExchange2Anonymous;
    static type: number;
    constructor(params: ServerDHParams);
    static read(binary: Binary, length: number): ServerKeyExchange2Anonymous;
}
declare class ServerKeyExchange2Ephemeral {
    readonly params: ServerDHParams;
    readonly signed_params: DigitallySigned;
    readonly class: typeof ServerKeyExchange2Ephemeral;
    static type: number;
    constructor(params: ServerDHParams, signed_params: DigitallySigned);
    static read(binary: Binary, length: number): ServerKeyExchange2Ephemeral;
}
declare class ServerKeyExchange2 {
    readonly class: typeof ServerKeyExchange2;
    static type: number;
    constructor();
    static read(binary: Binary, length: number): ServerKeyExchange2;
}

export { ServerDHParams, ServerKeyExchange2, ServerKeyExchange2Anonymous, ServerKeyExchange2Ephemeral };
