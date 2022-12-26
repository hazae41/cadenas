import { BitString, Integer, ObjectIdentifier } from "@hazae41/asn1"
import { Binary } from "@hazae41/binary"
import { AlgorithmIdentifier, Certificate, Name, OIDs, SubjectPublicKeyInfo, TBSCertificate, TBSCertificateVersion, Validity, X509 } from "@hazae41/x509"
import { Alert } from "mods/binary/alerts/alert.js"
import { Certificate2 } from "mods/binary/handshakes/certificate/certificate2.js"
import { CertificateRequest2 } from "mods/binary/handshakes/certificate_request/certificate_request2.js"
import { ClientHello2 } from "mods/binary/handshakes/client_hello/client_hello2.js"
import { Handshake, HandshakeHeader } from "mods/binary/handshakes/handshake.js"
import { ServerHello2 } from "mods/binary/handshakes/server_hello/server_hello2.js"
import { ServerHelloDone2 } from "mods/binary/handshakes/server_hello_done/server_hello_done2.js"
import { getServerKeyExchange2, ServerKeyExchange2 } from "mods/binary/handshakes/server_key_exchange/server_key_exchange2.js"
import { RecordHeader } from "mods/binary/record/record.js"
import { CipherSuite } from "mods/ciphers/cipher.js"
import { Transport } from "mods/transports/transport.js"

export type State =
  | NoneState
  | ServerHelloHandshakeState
  | ServerCertificateHandshakeState

export interface NoneState {
  type: "none"
}

export interface ServerHelloHandshakeState {
  type: "handshake",
  turn: "server",
  action: "hello"
  version: number
  cipher: CipherSuite
}

export interface ServerCertificateHandshakeState {
  type: "handshake",
  turn: "server",
  action: "certificate",
  version: number
  cipher: CipherSuite,
  certificates: Certificate[]
}

export interface ClientHandshakeState {
  type: "handshake",
  turn: "client",
  version: number
  cipher: CipherSuite,
  certificates: Certificate[]
}

export class Tls {
  private state: State = { type: "none" }

  readonly streams = new TransformStream<Buffer, Buffer>()

  private buffer = Buffer.allocUnsafe(4 * 4096)
  private wbinary = new Binary(this.buffer)
  private rbinary = new Binary(this.buffer)

  constructor(
    readonly transport: Transport,
    readonly ciphers: CipherSuite[]
  ) {
    this.tryRead()

    const onMessage = this.onMessage.bind(this)

    transport.addEventListener("message", onMessage, { passive: true })

    new FinalizationRegistry(() => {
      transport.removeEventListener("message", onMessage)
    }).register(this, undefined)
  }

  async handshake() {
    const hello = ClientHello2
      .default(this.ciphers)
      .handshake()
      .record(0x0301)
      .export()
    await this.transport.send(hello.buffer)
  }

  private async onMessage(event: Event) {
    const message = event as MessageEvent<Buffer>

    const writer = this.streams.writable.getWriter()
    writer.write(message.data).catch(console.warn)
    writer.releaseLock()
  }

  private async tryRead() {
    const reader = this.streams.readable.getReader()

    try {
      await this.read(reader)
    } finally {
      reader.releaseLock()
    }
  }

  private async read(reader: ReadableStreamDefaultReader<Buffer>) {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      this.wbinary.write(value)
      await this.onRead()
    }
  }

  private async onRead() {
    this.rbinary.buffer = this.buffer.subarray(0, this.wbinary.offset)

    while (this.rbinary.remaining) {
      try {
        const header = RecordHeader.tryRead(this.rbinary)

        if (!header) break

        await this.onRecord(this.rbinary, header)
      } catch (e: unknown) {
        console.error(e)
      }
    }

    if (!this.rbinary.offset)
      return

    if (this.rbinary.offset === this.wbinary.offset) {
      this.rbinary.offset = 0
      this.wbinary.offset = 0
      return
    }

    if (this.rbinary.remaining && this.wbinary.remaining < 4096) {
      console.debug(`Reallocating buffer`)

      const remaining = this.buffer.subarray(this.rbinary.offset, this.wbinary.offset)

      this.rbinary.offset = 0
      this.wbinary.offset = 0

      this.buffer = Buffer.allocUnsafe(4 * 4096)
      this.rbinary.buffer = this.buffer
      this.wbinary.buffer = this.buffer

      this.wbinary.write(remaining)
      return
    }
  }

  private async onRecord(binary: Binary, record: RecordHeader) {
    if (record.type === Alert.type)
      return this.onAlert(binary, record.length)
    if (record.type === Handshake.type)
      return this.onHandshake(binary, record.length)

    binary.offset += record.length

    console.warn(record)
  }

  private async onAlert(binary: Binary, length: number) {
    const alert = Alert.read(binary, length)

    console.log(alert)
  }

  private async onHandshake(binary: Binary, length: number) {
    const handshake = HandshakeHeader.read(binary, length)

    if (handshake.type === ServerHello2.type)
      return this.onServerHello(binary, handshake.length)
    if (handshake.type === Certificate2.type)
      return this.onCertificate(binary, handshake.length)
    if (handshake.type === ServerHelloDone2.type)
      return this.onServerHelloDone(binary, handshake.length)
    if (handshake.type === ServerKeyExchange2.type)
      return this.onServerKeyExchange(binary, handshake.length)
    if (handshake.type === CertificateRequest2.type)
      return this.onCertificateRequest(binary, handshake.length)

    binary.offset += handshake.length

    console.warn(handshake)
  }

  private async onServerHello(binary: Binary, length: number) {
    const hello = ServerHello2.read(binary, length)

    const version = hello.server_version

    if (version !== 0x0303)
      throw new Error(`Unsupported ${version} version`)

    const cipher = this.ciphers.find(it => it.id === hello.cipher_suite)

    if (cipher === undefined)
      throw new Error(`Unsupported ${hello.cipher_suite} cipher suite`)

    this.state = { type: "handshake", turn: "server", action: "hello", version, cipher }
  }

  private async onCertificate(binary: Binary, length: number) {
    const hello = Certificate2.read(binary, length)

    const certificates = hello.certificate_list.array
      .map(it => X509.Certificate.fromBuffer(it.buffer))

    this.state = { ...this.state, action: "certificate", certificates }

    console.log(certificates)
    console.log(certificates.map(it => it.tbsCertificate.issuer.toX501()))
    console.log(certificates.map(it => it.tbsCertificate.subject.toX501()))

    console.log(hello)
  }

  private async onServerKeyExchange(binary: Binary, length: number) {
    if (this.state.type !== "handshake")
      throw new Error(`Invalid state for onServerKeyExchange`)

    const hello = getServerKeyExchange2(this.state.cipher).read(binary, length)

    console.log(hello)
  }

  private async onCertificateRequest(binary: Binary, length: number) {
    const hello = CertificateRequest2.read(binary, length)

    console.log(hello)
  }

  private async generateCertificate() {
    const keypair = await crypto.subtle.generateKey({
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    }, true, ["sign"]) as CryptoKeyPair

    const publicKey = Buffer.from(await crypto.subtle.exportKey("spki", keypair.publicKey))

    const signatureAlgorithm = new AlgorithmIdentifier(new ObjectIdentifier(OIDs.keys.sha256WithRSAEncryption))

    const version = TBSCertificateVersion.fromNumber(2)

    const serialNumber = new Integer(BigInt(12345))

    const issuer = Name.fromX501("CN=www.fjsdinfu.com")

    const validity = Validity.generate(365)

    const subjetPublicKeyInfo = SubjectPublicKeyInfo.fromBuffer(publicKey)

    const tbsCertificate = new TBSCertificate(
      version,
      serialNumber,
      signatureAlgorithm,
      issuer,
      validity,
      issuer,
      subjetPublicKeyInfo,
      [])

    const signed = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keypair.privateKey, tbsCertificate.toBuffer())
    const certificate = new Certificate(tbsCertificate, signatureAlgorithm, new BitString(0, Buffer.from(signed)))

    return certificate
  }

  private async onServerHelloDone(binary: Binary, length: number) {
    const hello = ServerHelloDone2.read(binary, length)

    const certificate = await this.generateCertificate()

    console.log(certificate)

    console.log(hello)
  }
}