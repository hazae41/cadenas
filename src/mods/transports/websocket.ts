export class WebSocketStream {
  readonly readable: ReadableStream<Uint8Array>
  readonly writable: WritableStream<Uint8Array>

  constructor(
    readonly websocket: WebSocket
  ) {
    websocket.binaryType = "arraybuffer"

    this.readable = new ReadableStream({
      type: "bytes",
      start: this.onReadStart.bind(this),
      cancel: this.onReadCancel.bind(this)
    })

    this.writable = new WritableStream({
      start: this.onWriteStart.bind(this),
      write: this.onWrite.bind(this),
      abort: this.onWriteAbort.bind(this),
    })
  }

  private async onReadStart(controller: ReadableByteStreamController) {
    const onMessage = (e: MessageEvent) => {
      const chunk = new Uint8Array(e.data as ArrayBuffer)
      try { controller.enqueue(chunk) } catch (e: unknown) { }
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

    this.websocket.addEventListener("message", onMessage)
    this.websocket.addEventListener("error", onError)
    this.websocket.addEventListener("close", onClose)
  }

  private async onReadCancel() {
    this.websocket.close()
  }

  private async onWriteStart(controller: WritableStreamDefaultController) {
    const onError = (e: Event) => {
      this.websocket.removeEventListener("close", onClose)
      try { controller.error(e) } catch (e: unknown) { }
    }

    const onClose = (e: CloseEvent) => {
      this.websocket.removeEventListener("error", onError)
      try { controller.error() } catch (e: unknown) { }
    }

    this.websocket.addEventListener("error", onError)
    this.websocket.addEventListener("close", onClose)
  }

  private async onWrite(chunk: Uint8Array) {
    this.websocket.send(chunk)
  }

  private async onWriteAbort() {
    this.websocket.close()
  }
}