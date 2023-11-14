<div align="center">
<img src="https://user-images.githubusercontent.com/4405263/219942873-3a630e9e-07c0-405a-99c5-e85f8f32bfc1.png" />
</div>

```bash
npm i @hazae41/cadenas
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/cadenas)

## DO NOT USE

This is experimental software in early development

1. It has security issues
2. Things change quickly

## Features

### Current features
- 100% TypeScript and ESM
- Zero-copy reading and writing
- Transport agnostic (HTTP, WebSocket)
- WebStreams based backpressure
- [Common CA Database](https://www.ccadb.org/) certificates
- TLS 1.2

### [Upcoming Features](https://github.com/sponsors/hazae41)
- TLS 1.3
- Zero RTT

## Usage

```typescript
import { TlsClientDuplex, Ciphers } from "@hazae41/cadenas"

function example(tcp: ReadableWritablePair<Opaque, Writable>): ReadableWritablePair<Opaque, Writable> {
  const ciphers = [Ciphers.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384]
  const tls = new TlsClientDuplex({ host_name: "example.com", ciphers })

  tcp.readable
    .pipeTo(tls.inner.writable, {})
    .catch(e => console.error({ e }))

  tls.inner.readable
    .pipeTo(tcp.writable, {})
    .catch(e => console.error({ e }))

  return tls.outer
}
```