
export interface TransformByteStreamController {
  enqueue(chunk: ArrayBufferView): void
  error(e?: any): void
  terminate(): void
}

export interface ByteTransformer {
  start?: (controller: TransformByteStreamController) => Promise<void>
  transform?: (chunk: Uint8Array, controller: TransformByteStreamController) => void | Promise<void>
  flush?: (controller: TransformByteStreamController) => void | Promise<void>
}

export class TransformByteStream {
  readonly readable: ReadableStream<Uint8Array>
  readonly writable: WritableStream<Uint8Array>

  constructor(params: ByteTransformer) {
    let rcontroller: ReadableByteStreamController
    let wcontroller: WritableStreamDefaultController

    const tcontroller: TransformByteStreamController = {
      enqueue(chunk: ArrayBufferView) {
        rcontroller.enqueue(chunk)
      },
      error(e?: any) {
        rcontroller.error(e)
        wcontroller.error(e)
      },
      terminate() {
        rcontroller.close()
        wcontroller.error()
      }
    }

    this.readable = new ReadableStream({
      type: "bytes",

      async start(controller) {
        rcontroller = controller

        if (!wcontroller) return

        await params.start?.(tcontroller)
      },

      async cancel(reason) {
        if (!wcontroller) return

        wcontroller.error(reason)
      }
    })

    this.writable = new WritableStream<Uint8Array>({
      async start(controller) {
        wcontroller = controller

        if (!rcontroller) return

        await params.start?.(tcontroller)
      },

      async write(chunk) {
        if (!rcontroller) return

        await params.transform?.(chunk, tcontroller)
      },

      async abort(reason) {
        if (!rcontroller) return

        rcontroller.error(reason)
      },

      async close() {
        if (!rcontroller) return

        await params.flush?.(tcontroller)

        rcontroller.close()
      }
    })
  }
}