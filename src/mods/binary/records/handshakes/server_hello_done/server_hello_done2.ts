import { Cursor } from "@hazae41/cursor"
import { Ok, Result } from "@hazae41/result"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"

export class ServerHelloDone2 {

  static readonly type = Handshake.types.server_hello_done

  trySize(): Result<0, never> {
    return new Ok(0)
  }

  tryWrite(cursor: Cursor): Result<void, never> {
    return Ok.void()
  }

  static tryRead(cursor: Cursor): Result<ServerHelloDone2, never> {
    return new Ok(new ServerHelloDone2())
  }

}