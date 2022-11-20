import { Binary } from "libs/binary.js"
import { generateRandom } from "libs/random.js"

export class Random {

  constructor(
    readonly gmt_unix_time: number,
    readonly random_bytes: Buffer
  ) { }

  static default() {
    const gmt_unix_time = ~~(Date.now() / 1000)
    const random_bytes = generateRandom(28)

    return new this(gmt_unix_time, random_bytes)
  }

  size() {
    return 4 + this.random_bytes.length
  }

  write(binary: Binary) {
    binary.writeUint32(this.gmt_unix_time)
    binary.write(this.random_bytes)
  }
}