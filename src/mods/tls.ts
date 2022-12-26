import { Binary } from "@hazae41/binary"
import { Certificate, X509 } from "@hazae41/x509"
import { BigMath } from "libs/bigmath/index.js"
import { Alert } from "mods/binary/alerts/alert.js"
import { Certificate2 } from "mods/binary/handshakes/certificate/certificate2.js"
import { CertificateRequest2 } from "mods/binary/handshakes/certificate_request/certificate_request2.js"
import { ClientHello2 } from "mods/binary/handshakes/client_hello/client_hello2.js"
import { Handshake, HandshakeHeader } from "mods/binary/handshakes/handshake.js"
import { ServerHello2 } from "mods/binary/handshakes/server_hello/server_hello2.js"
import { ServerHelloDone2 } from "mods/binary/handshakes/server_hello_done/server_hello_done2.js"
import { getServerKeyExchange2, ServerKeyExchange2None } from "mods/binary/handshakes/server_key_exchange/server_key_exchange2.js"
import { ServerKeyExchange2Ephemeral } from "mods/binary/handshakes/server_key_exchange/server_key_exchange2_ephemeral.js"
import { RecordHeader } from "mods/binary/record/record.js"
import { CipherSuite } from "mods/ciphers/cipher.js"
import { Transport } from "mods/transports/transport.js"
import { ClientDiffieHellmanPublicExplicit } from "./binary/handshakes/client_key_exchange/client_diffie_hellman_public.js"
import { ClientKeyExchange2DH } from "./binary/handshakes/client_key_exchange/client_key_exchange2_dh.js"
import { ServerDHParams } from "./binary/handshakes/server_key_exchange/server_dh_params.js"
import { Number16 } from "./binary/number.js"
import { BufferVector } from "./binary/vector.js"

export type State =
  | NoneState
  | ClientHelloHandshakeState
  | ServerHelloHandshakeState
  | ServerCertificateHandshakeState
  | ServerKeyExchangeHandshakeState
  | ClientCertificateHandshakeState

export interface NoneState {
  type: "none"
}

export interface HandshakeState {
  type: "handshake"
}

export interface ClientHandshakeState extends HandshakeState {
  turn: "client"
}

export interface ServerHandshakeState extends HandshakeState {
  turn: "server"
}

export interface ClientHelloHandshakeState extends ClientHandshakeState {
  action: "client_hello"
}

export interface ServerHelloHandshakeState extends ServerHandshakeState {
  action: "server_hello"
  version: number
  cipher: CipherSuite
}

export interface ServerCertificateHandshakeState extends Omit<ServerHelloHandshakeState, "action"> {
  action: "certificate"
  certificates: Certificate[]
}

export interface ServerKeyExchangeHandshakeState extends Omit<ServerCertificateHandshakeState, "action"> {
  action: "server_key_exchange"
  server_dh_params: ServerDHParams
}

export interface ClientCertificateHandshakeState extends ClientHandshakeState {
  version: number
  cipher: CipherSuite
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
    if (handshake.type === ServerKeyExchange2None.type)
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

    this.state = { type: "handshake", turn: "server", action: "server_hello", version, cipher }
  }

  private async onCertificate(binary: Binary, length: number) {
    if (this.state.type !== "handshake")
      throw new Error(`Invalid state`)
    if (this.state.turn !== "server")
      throw new Error(`Invalid state`)
    if (this.state.action !== "server_hello")
      throw new Error(`Invalid state`)

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
      throw new Error(`Invalid state`)
    if (this.state.turn !== "server")
      throw new Error(`Invalid state`)
    if (this.state.action !== "certificate")
      throw new Error(`Invalid state`)

    const serverKeyExchange = getServerKeyExchange2(this.state.cipher).read(binary, length)

    if (serverKeyExchange instanceof ServerKeyExchange2Ephemeral) {
      this.state = {
        ...this.state,
        action: "server_key_exchange",
        server_dh_params: serverKeyExchange.params
      }
    }

    console.log(serverKeyExchange)
  }

  private async onCertificateRequest(binary: Binary, length: number) {
    const hello = CertificateRequest2.read(binary, length)

    console.log(hello)
  }

  // private async generateCertificate() {
  //   const keypair = await crypto.subtle.generateKey({
  //     name: "RSASSA-PKCS1-v1_5",
  //     modulusLength: 2048,
  //     publicExponent: new Uint8Array([1, 0, 1]),
  //     hash: "SHA-256",
  //   }, true, ["sign"]) as CryptoKeyPair

  //   const publicKey = Buffer.from(await crypto.subtle.exportKey("spki", keypair.publicKey))

  //   const signatureAlgorithm = new AlgorithmIdentifier(new ObjectIdentifier(OIDs.keys.sha256WithRSAEncryption))

  //   const version = TBSCertificateVersion.fromNumber(2)

  //   const serialNumber = new Integer(BigInt(12345))

  //   const issuer = Name.fromX501("CN=www.fjsdinfu.com")

  //   const validity = Validity.generate(365)

  //   const subjetPublicKeyInfo = SubjectPublicKeyInfo.fromBuffer(publicKey)

  //   const tbsCertificate = new TBSCertificate(
  //     version,
  //     serialNumber,
  //     signatureAlgorithm,
  //     issuer,
  //     validity,
  //     issuer,
  //     subjetPublicKeyInfo,
  //     [])

  //   const signed = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keypair.privateKey, tbsCertificate.toBuffer())
  //   const certificate = new Certificate(tbsCertificate, signatureAlgorithm, new BitString(0, Buffer.from(signed)))

  //   return certificate
  // }

  private async onServerHelloDone(binary: Binary, length: number) {
    if (this.state.type !== "handshake")
      throw new Error(`Invalid state`)
    if (this.state.turn !== "server")
      throw new Error(`Invalid state`)
    if (this.state.action !== "server_key_exchange")
      throw new Error(`Invalid state`)

    const hello = ServerHelloDone2.read(binary, length)

    console.log(this.state.cipher)

    const { dh_g, dh_p, dh_Ys } = this.state.server_dh_params

    const g = BigInt(`0x${dh_g.buffer.toString("hex")}`)
    const p = BigInt(`0x${dh_p.buffer.toString("hex")}`)
    const Ys = BigInt(`0x${dh_Ys.buffer.toString("hex")}`)

    const dh_yc = Buffer.allocUnsafe(dh_p.buffer.length)

    crypto.getRandomValues(dh_yc)

    const yc = BigInt(`0x${dh_yc.toString("hex")}`)

    const Yc = BigMath.umodpow(g, yc, p)
    const K = BigMath.umodpow(Ys, yc, p)

    const dh_Yc = Buffer.from(Yc.toString(16), "hex")
    const dh_K = Buffer.from(K.toString(16), "hex")

    console.log(dh_K)

    const premaster_secret = dh_K

    const vkey = new (BufferVector<Number16>(Number16))(dh_Yc)
    const cdhpe = new ClientDiffieHellmanPublicExplicit(vkey)
    const ckedh = new ClientKeyExchange2DH(cdhpe)

    console.log(hello)
  }
}