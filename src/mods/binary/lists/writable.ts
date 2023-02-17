import { Cursor, Writable } from "@hazae41/binary";

export interface List<T extends Writable> extends Writable {
  readonly array: T[]
}

export class List<T extends Writable> {

  constructor(
    readonly array: T[]
  ) { }

  static from<T extends Writable>(array: T[]) {
    return new this(array)
  }

  size() {
    let size = 0

    for (const element of this.array)
      size += element.size()

    return size
  }

  write(cursor: Cursor) {
    for (const element of this.array)
      element.write(cursor)
  }

}