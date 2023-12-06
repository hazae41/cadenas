// deno-lint-ignore-file no-inner-declarations
/// <reference lib="esnext" />
/// <reference lib="deno.ns" />
import { iterateReader, writeAll } from "https://deno.land/std@0.187.0/streams/mod.ts";

const server = Deno.listen({ port: 8080 })

for await (const conn of server)
  onconn(conn).catch(console.error)

async function pipeToWsAndLog(symbol: string, reader: Deno.Reader, socket: WebSocket) {
  for await (const bytes of iterateReader(reader)) {
    // console.debug(symbol, bytes)
    socket.send(bytes)
  }
}

async function onconn(conn: Deno.Conn) {
  const http = Deno.serveHttp(conn)

  for await (const { request, respondWith } of http) {
    try {
      const { socket, response } = Deno.upgradeWebSocket(request);

      const target = await Deno.connect({ hostname: "canto.gravitychain.io", port: 443, transport: "tcp" })

      socket.binaryType = "arraybuffer"

      function closeSocket() {
        if (socket.readyState !== WebSocket.OPEN)
          return
        console.log("close socket")
        socket.close()
      }

      function closeTarget() {
        console.log("close target")
        target.close()
      }

      socket.addEventListener("message", async e => {
        const bytes = new Uint8Array(e.data)
        // console.debug("->", bytes)

        try {
          await writeAll(target, bytes)
        } catch (_: unknown) {
          closeSocket()
        }
      })

      socket.addEventListener("close", () => closeTarget())

      pipeToWsAndLog("<-", target, socket)
        .catch(() => { })
        .finally(() => closeSocket())

      await respondWith(response)
    } catch (_: unknown) {
      await respondWith(new Response(undefined, { status: 500 }))
    }
  }
}