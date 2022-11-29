import { Binary } from '../../libs/binary.js';
import { Number16 } from './number.js';
import { Vector } from './vector.js';

declare class HashAlgorithm {
    readonly type: number;
    readonly class: typeof HashAlgorithm;
    static types: {
        none: number;
        md5: number;
        sha1: number;
        sha224: number;
        sha256: number;
        sha384: number;
        sha512: number;
    };
    constructor(type: number);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary): HashAlgorithm;
}
declare class SignatureAlgorithm {
    readonly type: number;
    readonly class: typeof SignatureAlgorithm;
    static types: {
        anonymous: number;
        rsa: number;
        dsa: number;
        ecdsa: number;
    };
    constructor(type: number);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary): SignatureAlgorithm;
}
declare class SignatureAndHashAlgorithm {
    readonly hash: HashAlgorithm;
    readonly signature: SignatureAlgorithm;
    readonly class: typeof SignatureAndHashAlgorithm;
    constructor(hash: HashAlgorithm, signature: SignatureAlgorithm);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary): SignatureAndHashAlgorithm;
}
declare class DigitallySigned {
    readonly algorithm: SignatureAndHashAlgorithm;
    readonly signature: Vector<Number16>;
    readonly class: typeof DigitallySigned;
    constructor(algorithm: SignatureAndHashAlgorithm, signature: Vector<Number16>);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary): DigitallySigned;
}

export { DigitallySigned, HashAlgorithm, SignatureAlgorithm, SignatureAndHashAlgorithm };
