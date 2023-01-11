import { Future } from "libs/futures/future.js"

async function tryClose(websocket: WebSocket) {
  const close = new Future<void>()

  const onClose = (e: CloseEvent) => {
    if (e.wasClean)
      close.ok()
    else
      close.err(e)
  }

  try {
    websocket.addEventListener("close", onClose, { passive: true })

    await close.promise
  } finally {
    websocket.removeEventListener("close", onClose)
  }
}

export type WebSocketStreamParams =
  & WebSocketSourceParams
  & WebSocketSinkParams

export class WebSocketStream {
  readonly readable: ReadableStream<Uint8Array>
  readonly writable: WritableStream<Uint8Array>

  /**
   * A WebSocket stream
   * @description https://streams.spec.whatwg.org/#example-both
   */
  constructor(
    readonly websocket: WebSocket,
    readonly params: WebSocketStreamParams = {}
  ) {
    if (websocket.readyState !== WebSocket.OPEN)
      throw new Error(`WebSocket is not open`)
    if (websocket.binaryType !== "arraybuffer")
      throw new Error(`WebSocket binaryType is not arraybuffer`)

    this.readable = new ReadableStream(new WebSocketSource(websocket))
    this.writable = new WritableStream(new WebSocketSink(websocket))
  }
}

export interface WebSocketSourceParams {
  /**
   * Whether the socket should be closed when the stream is cancelled
   * @description You don't want to reuse the socket
   */
  shouldCloseOnCancel?: boolean
}

export class WebSocketSource implements UnderlyingByteSource {
  readonly type = "bytes"

  constructor(
    readonly websocket: WebSocket,
    readonly params: WebSocketSourceParams = {}
  ) { }

  async start(controller: ReadableByteStreamController) {
    const onMessage = (e: MessageEvent) => {
      const chunk = new Uint8Array(e.data as ArrayBuffer)
      controller.enqueue(chunk)
    }

    const onError = (e: Event) => {
      this.websocket.removeEventListener("message", onMessage)
      this.websocket.removeEventListener("close", onClose)
      try { controller.error(e) } catch (e: unknown) { }
    }

    const onClose = (e: CloseEvent) => {
      this.websocket.removeEventListener("message", onMessage)
      this.websocket.removeEventListener("error", onError)
      try { controller.close() } catch (e: unknown) { }
    }

    this.websocket.addEventListener("message", onMessage, { passive: true })
    this.websocket.addEventListener("error", onError, { passive: true })
    this.websocket.addEventListener("close", onClose, { passive: true })
  }

  async cancel() {
    if (!this.params.shouldCloseOnCancel) return

    this.websocket.close()
  }
}

export interface WebSocketSinkParams {
  /**
   * Whether the socket should be closed when the stream is closed
   * @description You don't want to reuse the socket
   * @description You're not using request-response
   */
  shouldCloseOnClose?: boolean

  /**
   * Whether the socket should be closed when the stream is aborted
   * @description You don't want to reuse the socket
   */
  shouldCloseOnAbort?: boolean
}

export class WebSocketSink implements UnderlyingSink<Uint8Array> {

  constructor(
    readonly websocket: WebSocket,
    readonly params: WebSocketSinkParams = {}
  ) { }

  async start(controller: WritableStreamDefaultController) {
    const onError = (e: Event) => {
      this.websocket.removeEventListener("close", onClose)
      try { controller.error(e) } catch (e: unknown) { }
    }

    const onClose = (e: CloseEvent) => {
      this.websocket.removeEventListener("error", onError)
      try { controller.error(e) } catch (e: unknown) { }
    }

    this.websocket.addEventListener("error", onError, { passive: true })
    this.websocket.addEventListener("close", onClose, { passive: true })
  }

  async write(chunk: Uint8Array) {
    this.websocket.send(chunk)
  }

  async abort() {
    if (!this.params.shouldCloseOnAbort) return

    await tryClose(this.websocket)
  }

  async close() {
    if (!this.params.shouldCloseOnClose) return

    await tryClose(this.websocket)
  }
}