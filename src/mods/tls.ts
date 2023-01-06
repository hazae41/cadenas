import { Binary } from "@hazae41/binary"
import { Certificate, X509 } from "@hazae41/x509"
import { BigMath } from "libs/bigmath/index.js"
import { PRF } from "mods/algorithms/prf/prf.js"
import { Alert } from "mods/binary/alerts/alert.js"
import { Certificate2 } from "mods/binary/handshakes/certificate/certificate2.js"
import { CertificateRequest2 } from "mods/binary/handshakes/certificate_request/certificate_request2.js"
import { ClientHello2 } from "mods/binary/handshakes/client_hello/client_hello2.js"
import { ClientDiffieHellmanPublicExplicit } from "mods/binary/handshakes/client_key_exchange/client_diffie_hellman_public.js"
import { ClientKeyExchange2DH } from "mods/binary/handshakes/client_key_exchange/client_key_exchange2_dh.js"
import { Finished2 } from "mods/binary/handshakes/finished/finished2.js"
import { Handshake, HandshakeHeader } from "mods/binary/handshakes/handshake.js"
import { ServerHello2 } from "mods/binary/handshakes/server_hello/server_hello2.js"
import { ServerHelloDone2 } from "mods/binary/handshakes/server_hello_done/server_hello_done2.js"
import { ServerDHParams } from "mods/binary/handshakes/server_key_exchange/server_dh_params.js"
import { getServerKeyExchange2, ServerKeyExchange2None } from "mods/binary/handshakes/server_key_exchange/server_key_exchange2.js"
import { ServerKeyExchange2Ephemeral } from "mods/binary/handshakes/server_key_exchange/server_key_exchange2_ephemeral.js"
import { Number16 } from "mods/binary/number.js"
import { ChangeCipherSpec } from "mods/binary/record/change_cipher_spec/change_cipher_spec.js"
import { PlaintextGenericBlockCipher, RecordHeader } from "mods/binary/record/record.js"
import { BufferVector } from "mods/binary/vector.js"
import { CipherSuite } from "mods/ciphers/cipher.js"
import { Secrets } from "mods/ciphers/secrets.js"
import { Transport } from "mods/transports/transport.js"

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
  messages: Buffer[]
}

export interface ClientHandshakeState extends HandshakeState {
  turn: "client"
}

export interface ServerHandshakeState extends HandshakeState {
  turn: "server"
}

export interface ClientHelloHandshakeState extends ClientHandshakeState {
  action: "client_hello"
  client_random: Buffer
}

export interface ServerHelloHandshakeState extends ServerHandshakeState {
  action: "server_hello"
  version: number
  cipher: CipherSuite
  client_random: Buffer
  server_random: Buffer
}

export interface ServerCertificateHandshakeState extends ServerHandshakeState {
  action: "certificate"
  version: number
  cipher: CipherSuite
  client_random: Buffer
  server_random: Buffer
  server_certificates: Certificate[]
}

export interface ServerKeyExchangeHandshakeState extends ServerHandshakeState {
  action: "server_key_exchange"
  version: number
  cipher: CipherSuite
  client_random: Buffer
  server_random: Buffer
  server_certificates: Certificate[]
  server_dh_params: ServerDHParams
}

export interface ClientCertificateHandshakeState extends ClientHandshakeState {
  action: "client_certificate"
  version: number
  cipher: CipherSuite
  client_random: Buffer
  server_random: Buffer
  server_certificates: Certificate[]
  server_dh_params: ServerDHParams
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
    const hello = ClientHello2.default(this.ciphers)

    const record = hello.handshake().record(0x0301)
    const precord = this.transport.send(record.export())

    const client_random = hello.random.export().buffer

    this.state = { ...this.state, type: "handshake", messages: [], turn: "client", action: "client_hello", client_random }

    await precord
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
    if (record.subtype === Alert.type)
      return this.onAlert(binary, record)
    if (record.subtype === Handshake.type)
      return this.onHandshake(binary, record)
    if (record.subtype === ChangeCipherSpec.type)
      return this.onChangeCipherSpec(binary, record)

    binary.offset += record.length

    console.warn(record)
  }

  private async onAlert(binary: Binary, record: RecordHeader) {
    const { fragment } = record.plaintext<Alert>(binary, Alert)

    console.log(fragment)
  }

  private async onChangeCipherSpec(binary: Binary, record: RecordHeader) {
    const { fragment } = record.plaintext<ChangeCipherSpec>(binary, ChangeCipherSpec)

    console.log(fragment)
  }

  private async onHandshake(binary: Binary, record: RecordHeader) {
    if (this.state.type !== "handshake")
      throw new Error(`Invalid state`)

    const raw = binary.get(length)

    const { fragment } = record.plaintext<HandshakeHeader>(binary, HandshakeHeader)

    if (fragment.subtype !== Handshake.types.hello_request)
      this.state.messages.push(raw)

    if (fragment.subtype === ServerHello2.type)
      return this.onServerHello(binary, fragment.length)
    if (fragment.subtype === Certificate2.type)
      return this.onCertificate(binary, fragment.length)
    if (fragment.subtype === ServerHelloDone2.type)
      return this.onServerHelloDone(binary, fragment.length)
    if (fragment.subtype === ServerKeyExchange2None.type)
      return this.onServerKeyExchange(binary, fragment.length)
    if (fragment.subtype === CertificateRequest2.type)
      return this.onCertificateRequest(binary, fragment.length)

    binary.offset += fragment.length

    console.warn(fragment)
  }

  private async onServerHello(binary: Binary, length: number) {
    if (this.state.type !== "handshake")
      throw new Error(`Invalid state`)
    if (this.state.turn !== "client")
      throw new Error(`Invalid state`)
    if (this.state.action !== "client_hello")
      throw new Error(`Invalid state`)

    const hello = ServerHello2.read(binary, length)

    const version = hello.server_version

    if (version !== 0x0303)
      throw new Error(`Unsupported ${version} version`)

    const cipher = this.ciphers.find(it => it.id === hello.cipher_suite)

    if (cipher === undefined)
      throw new Error(`Unsupported ${hello.cipher_suite} cipher suite`)

    const server_random = hello.random.export().buffer

    this.state = { ...this.state, type: "handshake", turn: "server", action: "server_hello", version, cipher, server_random }
  }

  private async onCertificate(binary: Binary, length: number) {
    if (this.state.type !== "handshake")
      throw new Error(`Invalid state`)
    if (this.state.turn !== "server")
      throw new Error(`Invalid state`)
    if (this.state.action !== "server_hello")
      throw new Error(`Invalid state`)

    const hello = Certificate2.read(binary, length)

    const server_certificates = hello.certificate_list.array
      .map(it => X509.Certificate.fromBuffer(it.buffer))

    this.state = { ...this.state, type: "handshake", turn: "server", action: "certificate", server_certificates }

    console.log(server_certificates)
    console.log(server_certificates.map(it => it.tbsCertificate.issuer.toX501()))
    console.log(server_certificates.map(it => it.tbsCertificate.subject.toX501()))

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

    if (serverKeyExchange instanceof ServerKeyExchange2Ephemeral)
      this.state = {
        ...this.state,
        action: "server_key_exchange",
        server_dh_params: serverKeyExchange.params
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

    const { dh_Yc, dh_Z } = await this.computeDiffieHellman(this.state)

    const vkey = new (BufferVector<Number16>(Number16))(dh_Yc)
    const cdhpe = new ClientDiffieHellmanPublicExplicit(vkey)
    const ckedh = new ClientKeyExchange2DH(cdhpe)

    const premaster_secret = dh_Z

    const secrets = await this.computeSecrets(this.state, premaster_secret)

    const bhckedh = ckedh.handshake().export()
    this.state.messages.push(bhckedh)

    const handshake_messages = Buffer.concat(this.state.messages)

    const verify_data = await PRF("SHA-256", secrets.master_secret, "client finished", handshake_messages, 12)
    const finished = new Finished2(verify_data)

    const brckedh = ckedh.handshake().record(this.state.version).export()
    const brccs = new ChangeCipherSpec().record(this.state.version).export()

    const prfinished = finished.handshake().record(this.state.version)
    const drfinished = await PlaintextGenericBlockCipher.from(prfinished, secrets, BigInt(0))
    const erfinished = await drfinished.encrypt(this.state.cipher, secrets)
    const crfinished = prfinished.ciphertext(erfinished).export()

    console.log("ClientKey", brckedh.toString("hex"))
    console.log("ChangeCipherSpec", brccs.toString("hex"))
    console.log("PlaintextRecord", prfinished.export().toString("hex"))
    console.log("CiphertextCipher", erfinished.export().toString("hex"))
    console.log("CiphertextRecord", crfinished.toString("hex"))

    this.transport.send(Buffer.concat([brckedh, brccs, crfinished]))
  }

  private async computeDiffieHellman(state: ServerKeyExchangeHandshakeState) {
    const { dh_g, dh_p, dh_Ys } = state.server_dh_params

    const g = BigInt(`0x${dh_g.buffer.toString("hex")}`)
    const p = BigInt(`0x${dh_p.buffer.toString("hex")}`)
    const Ys = BigInt(`0x${dh_Ys.buffer.toString("hex")}`)

    const dh_yc = Buffer.allocUnsafe(dh_p.buffer.length)

    crypto.getRandomValues(dh_yc)

    const yc = BigInt(`0x${dh_yc.toString("hex")}`)

    const Yc = BigMath.umodpow(g, yc, p)
    const Z = BigMath.umodpow(Ys, yc, p)

    const dh_Yc = Buffer.from(Yc.toString(16), "hex")
    const dh_Z = Buffer.from(Z.toString(16), "hex")

    return { dh_Yc, dh_Z }
  }

  private async computeSecrets(state: ServerKeyExchangeHandshakeState, premaster_secret: Buffer) {
    const { cipher, client_random, server_random } = state

    const master_secret_seed = Buffer.concat([client_random, server_random])
    const master_secret = await PRF("SHA-256", premaster_secret, "master secret", master_secret_seed, 48)

    const key_block_length = 0
      + (2 * cipher.hash.mac_key_length)
      + (2 * cipher.encryption.enc_key_length)
      + (2 * cipher.encryption.fixed_iv_length)

    const key_block_seed = Buffer.concat([server_random, client_random])
    const key_block = await PRF("SHA-256", master_secret, "key expansion", key_block_seed, key_block_length)

    const key_block_binary = new Binary(key_block)

    const client_write_MAC_key = key_block_binary.read(cipher.hash.mac_key_length)
    const server_write_MAC_key = key_block_binary.read(cipher.hash.mac_key_length)

    const client_write_key = key_block_binary.read(cipher.encryption.enc_key_length)
    const server_write_key = key_block_binary.read(cipher.encryption.enc_key_length)

    const client_write_IV = key_block_binary.read(cipher.encryption.fixed_iv_length)
    const server_write_IV = key_block_binary.read(cipher.encryption.fixed_iv_length)

    console.log("original_iv", client_write_IV.toString("hex"));

    return {
      master_secret,
      client_write_MAC_key,
      server_write_MAC_key,
      client_write_key,
      server_write_key,
      client_write_IV,
      server_write_IV
    } as Secrets
  }
}