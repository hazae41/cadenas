declare class Extension {
    readonly type: number;
    readonly data: Buffer;
    readonly class: typeof Extension;
    constructor(type: number, data: Buffer);
    get blength(): number;
    write(): Buffer;
}

export { Extension };
