import { Binary } from '../../../../libs/binary.js';
import { Number8, Number16 } from '../../number.js';
import { SignatureAndHashAlgorithm } from '../../signature.js';
import { ArrayVector, Vector } from '../../vector.js';

declare class ClientCertificateType {
    readonly type: number;
    readonly class: typeof ClientCertificateType;
    static types: {
        rsa_sign: number;
        dss_sign: number;
        rsa_fixed_dh: number;
        dss_fixed_dh: number;
        rsa_ephemeral_dh_RESERVED: number;
        dss_ephemeral_dh_RESERVED: number;
        fortezza_dms_RESERVED: number;
    };
    constructor(type: number);
    size(): number;
    write(binary: Binary): void;
    static read(binary: Binary): ClientCertificateType;
}
declare class CertificateRequest2 {
    readonly certificate_types: ArrayVector<Number8, ClientCertificateType>;
    readonly supported_signature_algorithms: ArrayVector<Number16, SignatureAndHashAlgorithm>;
    readonly certificate_authorities: Vector<Number16>;
    readonly class: typeof CertificateRequest2;
    static type: number;
    constructor(certificate_types: ArrayVector<Number8, ClientCertificateType>, supported_signature_algorithms: ArrayVector<Number16, SignatureAndHashAlgorithm>, certificate_authorities: Vector<Number16>);
    static read(binary: Binary, length: number): CertificateRequest2;
}

export { CertificateRequest2, ClientCertificateType };
