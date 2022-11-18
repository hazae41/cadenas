declare class ClientSupportedVersions {
    readonly versions: number[];
    constructor(versions: number[]);
    get blength(): number;
    write(): Buffer;
}

export { ClientSupportedVersions };
