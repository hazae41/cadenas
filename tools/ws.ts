
const server = Deno.listen({ port: 8081 })

for await (const conn of server)
  onconn(conn).catch(console.error)

async function onconn(conn: Deno.Conn) {
  const http = Deno.serveHttp(conn)

  for await (const { request, respondWith } of http) {
    try {
      const { socket, response } = Deno.upgradeWebSocket(request);

      onsocket(socket)

      await respondWith(response)
    } catch (_: unknown) {
      await respondWith(new Response(undefined, { status: 500 }))
    }
  }
}

function onsocket(socket: WebSocket) {
  socket.binaryType = "arraybuffer"

  socket.addEventListener("message", e => {
    try {
      const buffer = new Uint8Array(e.data)
      console.debug("->", buffer)
      socket.send(buffer)
    } catch (_: unknown) {
      socket.close()
      return
    }
  })
}