import { Binary } from "@hazae41/binary"
import { Certificate, X509 } from "@hazae41/x509"
import { BigMath } from "libs/bigmath/index.js"
import { Bytes } from "libs/bytes/bytes.js"
import { CloseEvent } from "libs/events/close.js"
import { ErrorEvent } from "libs/events/error.js"
import { Future } from "libs/futures/future.js"
import { PRF } from "mods/algorithms/prf/prf.js"
import { Number16, Number24 } from "mods/binary/number.js"
import { Opaque } from "mods/binary/opaque.js"
import { Alert } from "mods/binary/records/alerts/alert.js"
import { ChangeCipherSpec } from "mods/binary/records/change_cipher_spec/change_cipher_spec.js"
import { GenericAEADCipher } from "mods/binary/records/generic_ciphers/aead/aead.js"
import { GenericBlockCipher } from "mods/binary/records/generic_ciphers/block/block.js"
import { Certificate2 } from "mods/binary/records/handshakes/certificate/certificate2.js"
import { CertificateRequest2 } from "mods/binary/records/handshakes/certificate_request/certificate_request2.js"
import { ClientHello2 } from "mods/binary/records/handshakes/client_hello/client_hello2.js"
import { ClientDiffieHellmanPublicExplicit } from "mods/binary/records/handshakes/client_key_exchange/client_diffie_hellman_public.js"
import { ClientKeyExchange2DH } from "mods/binary/records/handshakes/client_key_exchange/client_key_exchange2_dh.js"
import { Finished2 } from "mods/binary/records/handshakes/finished/finished2.js"
import { Handshake, HandshakeHeader } from "mods/binary/records/handshakes/handshake.js"
import { ServerHello2 } from "mods/binary/records/handshakes/server_hello/server_hello2.js"
import { ServerHelloDone2 } from "mods/binary/records/handshakes/server_hello_done/server_hello_done2.js"
import { ServerDHParams } from "mods/binary/records/handshakes/server_key_exchange/server_dh_params.js"
import { getServerKeyExchange2, ServerKeyExchange2None } from "mods/binary/records/handshakes/server_key_exchange/server_key_exchange2.js"
import { ServerKeyExchange2Ephemeral } from "mods/binary/records/handshakes/server_key_exchange/server_key_exchange2_ephemeral.js"
import { AEADCiphertextRecord, BlockCiphertextRecord, PlaintextRecord, Record, RecordHeader } from "mods/binary/records/record.js"
import { ArrayVector, BytesVector } from "mods/binary/vector.js"
import { Cipher } from "mods/ciphers/cipher.js"
import { Encrypter } from "mods/ciphers/encryptions/encryption.js"
import { Secrets } from "mods/ciphers/secrets.js"

export type State =
  | NoneState
  | HandshakeState
  | DataState

export interface NoneState {
  type: "none"
  client_encrypted: false
  server_encrypted: false
}

export type HandshakeState =
  | ClientHelloHandshakeState
  | ServerHelloHandshakeState
  | ServerCertificateHandshakeState
  | ServerKeyExchangeHandshakeState
  | ServerCertificateRequestHandshakeState
  | ClientCertificateHandshakeState
  | ClientChangeCipherSpecHandshakeState
  | ClientFinishedHandshakeState
  | ServerChangeCipherSpecHandshakeState

export const HandshakeSteps = {
  client_hello: 0,
  server_hello: 1,
  server_certificate: 2,
  server_key_exchange: 3,
  client_certificate: 4,
  client_change_cipher_spec: 5,
  client_finished: 6,
  server_change_cipher_spec: 7,
  server_finished: 8
}

export interface ClientHelloHandshakeData {
  messages: Uint8Array[]
  client_random: Uint8Array
}

export interface ClientHelloHandshakeState extends ClientHelloHandshakeData {
  type: "handshake"
  step: "client_hello"
  client_encrypted: false
  server_encrypted: false
}

export interface ServerHelloHandshakeData extends ClientHelloHandshakeData {
  version: number
  cipher: Cipher
  server_random: Uint8Array
}

export interface ServerHelloHandshakeState extends ServerHelloHandshakeData {
  type: "handshake"
  step: "server_hello"
  client_encrypted: false
  server_encrypted: false
}

export interface ServerCertificateHandshakeData extends ServerHelloHandshakeData {
  server_certificates: Certificate[]
}

export interface ServerCertificateHandshakeState extends ServerCertificateHandshakeData {
  type: "handshake"
  step: "server_hello"
  action: "server_certificate"
  client_encrypted: false
  server_encrypted: false
}

export interface ServerKeyExchangeHandshakeData extends ServerHelloHandshakeData {
  server_dh_params: ServerDHParams
}

export interface ServerKeyExchangeHandshakeState extends ServerKeyExchangeHandshakeData {
  type: "handshake"
  step: "server_hello"
  action: "server_key_exchange"
  client_encrypted: false
  server_encrypted: false
}

export interface ServerCertificateRequestHandshakeStateData extends ServerHelloHandshakeData {
  certificate_request: CertificateRequest2
}

export interface ServerCertificateRequestHandshakeState extends ServerCertificateRequestHandshakeStateData {
  type: "handshake"
  step: "server_hello"
  action: "server_certificate_request"
  client_encrypted: false
  server_encrypted: false
}

export interface ClientCertificateHandshakeStateData extends ServerKeyExchangeHandshakeData { }

export interface ClientCertificateHandshakeState extends ClientCertificateHandshakeStateData {
  type: "handshake"
  step: "client_finish"
  action: "client_certificate"
  client_encrypted: false
  server_encrypted: false
}

export interface ClientChangeCipherSpecHandshakeData extends ServerHelloHandshakeData {
  encrypter: Encrypter
  client_sequence: bigint
}

export interface ClientChangeCipherSpecHandshakeState extends ClientChangeCipherSpecHandshakeData {
  type: "handshake"
  step: "client_change_cipher_spec"
  client_encrypted: true
  server_encrypted: false
}

export interface ClientFinishedHandshakeData extends ClientChangeCipherSpecHandshakeData { }

export interface ClientFinishedHandshakeState extends ClientFinishedHandshakeData {
  type: "handshake"
  step: "client_finished"
  client_encrypted: true
  server_encrypted: false
}

export interface ServerChangeCipherSpecHandshakeData extends ClientFinishedHandshakeData {
  server_sequence: bigint
}

export interface ServerChangeCipherSpecHandshakeState extends ServerChangeCipherSpecHandshakeData {
  type: "handshake"
  step: "server_change_cipher_spec"
  client_encrypted: true
  server_encrypted: true
}

export interface DataStateData extends ServerChangeCipherSpecHandshakeData { }

export interface DataState extends DataStateData {
  type: "data"
  client_encrypted: true
  server_encrypted: true
}

export interface TlsParams {
  ciphers: Cipher[]
  signal?: AbortSignal,
  debug?: boolean
}

export class TlsStream extends EventTarget {
  readonly readable: ReadableStream<Uint8Array>
  readonly writable: WritableStream<Uint8Array>

  readonly read = new EventTarget()
  readonly write = new EventTarget()

  private state: State = { type: "none", client_encrypted: false, server_encrypted: false }

  private _input?: TransformStreamDefaultController<Uint8Array>
  private _output?: TransformStreamDefaultController<Uint8Array>

  private buffer = Bytes.allocUnsafe(4 * 4096)
  private wbinary = new Binary(this.buffer)
  private rbinary = new Binary(this.buffer)

  constructor(
    readonly stream: ReadableWritablePair<Uint8Array>,
    readonly params: TlsParams
  ) {
    super()

    const { signal } = params

    const read = new TransformStream<Uint8Array>({
      start: this.onReadStart.bind(this),
      transform: this.onRead.bind(this),
    })

    const write = new TransformStream<Uint8Array>({
      start: this.onWriteStart.bind(this),
      transform: this.onWrite.bind(this),
    })

    const [readable, trashable] = read.readable.tee()

    this.readable = readable
    this.writable = write.writable

    stream.readable
      .pipeTo(read.writable, { signal })
      .then(this.onReadClose.bind(this))
      .catch(this.onReadError.bind(this))

    write.readable
      .pipeTo(stream.writable, { signal })
      .then(this.onWriteClose.bind(this))
      .catch(this.onWriteError.bind(this))

    const trash = new WritableStream()

    trashable
      .pipeTo(trash, { signal })
      .then(this.onReadClose.bind(this))
      .catch(this.onReadError.bind(this))

    const onError = this.onError.bind(this)

    this.read.addEventListener("error", onError, { passive: true })
    this.write.addEventListener("error", onError, { passive: true })
  }

  get input() {
    return this._input!
  }

  get output() {
    return this._output!
  }

  private async onReadClose() {
    const event = new CloseEvent("close", {})
    if (!this.read.dispatchEvent(event)) return
  }

  private async onWriteClose() {
    const event = new CloseEvent("close", {})
    if (!this.write.dispatchEvent(event)) return
  }

  private async onReadError(error?: unknown) {
    const event = new ErrorEvent("error", { error })
    if (!this.read.dispatchEvent(event)) return
  }

  private async onWriteError(error?: unknown) {
    const event = new ErrorEvent("error", { error })
    if (!this.write.dispatchEvent(event)) return
  }

  private async onError(error?: unknown) {
    const event = new ErrorEvent("error", { error })
    if (!this.dispatchEvent(event)) return

    try { this.input.error(error) } catch (e: unknown) { }
    try { this.output.error(error) } catch (e: unknown) { }
  }

  private async onReadStart(controller: TransformStreamDefaultController<Uint8Array>) {
    this._input = controller
  }

  private async onWriteStart(controller: TransformStreamDefaultController<Uint8Array>) {
    this._output = controller
  }

  async handshake() {
    if (this.state.type !== "none")
      throw new Error(`Invalid state`)

    const client_hello = ClientHello2.default(this.params.ciphers)

    const client_random = client_hello.random.export()

    this.state = { ...this.state, type: "handshake", messages: [], step: "client_hello", client_random }

    const handshake = client_hello.handshake()
    this.state.messages.push(handshake.export())

    const record = handshake.record(0x0301)
    this.output.enqueue(record.export())

    const finished = new Future<Event>()

    try {
      this.read.addEventListener("close", finished.err, { passive: true })
      this.addEventListener("error", finished.err, { passive: true })
      this.addEventListener("finished", finished.ok, { passive: true })

      await finished.promise
    } finally {
      this.read.removeEventListener("close", finished.err)
      this.removeEventListener("error", finished.err)
      this.removeEventListener("finished", finished.ok)
    }
  }

  private async onRead(chunk: Uint8Array) {
    this.wbinary.write(chunk)
    this.rbinary.view = this.buffer.subarray(0, this.wbinary.offset)

    while (this.rbinary.remaining) {
      const header = RecordHeader.tryRead(this.rbinary)

      if (!header) break

      try {
        await this.onRecord(header, this.rbinary)
      } catch (e: unknown) {
        console.error(e)
        throw e
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

      this.buffer = Bytes.allocUnsafe(4 * 4096)
      this.rbinary.view = this.buffer
      this.wbinary.view = this.buffer

      this.wbinary.write(remaining)
      return
    }
  }

  private async onWrite(chunk: Uint8Array) {
    if (this.state.type !== "data")
      throw new Error(`Invalid state`)

    const { version, encrypter } = this.state
    const type = Record.types.application_data
    const fragment = new Opaque(chunk)

    const plaintext = new PlaintextRecord(type, version, fragment)
    const ciphertext = await plaintext.encrypt(encrypter, this.state.client_sequence++)

    this.output.enqueue(ciphertext.export())
  }

  private async onRecord(header: RecordHeader, binary: Binary) {
    if (this.state.server_encrypted)
      return await this.onCiphertextRecord(header, binary)

    const fragment = Opaque.read(binary, header.length)
    const record = PlaintextRecord.from(header, fragment)

    return await this.onPlaintextRecord(record)
  }

  private async onCiphertextRecord(header: RecordHeader, binary: Binary) {
    if (!this.state.server_encrypted)
      throw new Error(`Invalid state`)

    if (this.state.encrypter.cipher_type === "block") {
      const gcipher = GenericBlockCipher.read(binary, header.length)
      const cipher = BlockCiphertextRecord.from(header, gcipher)
      const plain = await cipher.decrypt(this.state.encrypter, this.state.server_sequence++)
      return await this.onPlaintextRecord(plain)
    }

    if (this.state.encrypter.cipher_type === "aead") {
      const gcipher = GenericAEADCipher.read(binary, header.length)
      const cipher = AEADCiphertextRecord.from(header, gcipher)
      const plain = await cipher.decrypt(this.state.encrypter, this.state.server_sequence++)
      return await this.onPlaintextRecord(plain)
    }

    throw new Error(`Invalid cipher type`)
  }

  private async onPlaintextRecord(record: PlaintextRecord<Opaque>) {
    if (record.subtype === Alert.type)
      return await this.onAlert(record)
    if (record.subtype === Handshake.type)
      return await this.onHandshake(record)
    if (record.subtype === ChangeCipherSpec.type)
      return await this.onChangeCipherSpec(record)
    if (record.subtype === Record.types.application_data)
      return await this.onApplicationData(record)

    console.warn(record)
  }

  private async onAlert(record: PlaintextRecord<Opaque>) {
    const fragment = record.fragment.into<Alert>(Alert)

    console.log(fragment)
  }

  private async onChangeCipherSpec(record: PlaintextRecord<Opaque>) {
    if (this.state.type !== "handshake")
      throw new Error(`Invalid state`)
    if (this.state.step !== "client_finished")
      throw new Error(`Invalid state`)

    const fragment = record.fragment.into<ChangeCipherSpec>(ChangeCipherSpec)

    this.state = { ...this.state, step: "server_change_cipher_spec", server_encrypted: true, server_sequence: BigInt(0) }

    console.log(fragment)
  }

  private async onApplicationData(record: PlaintextRecord<Opaque>) {
    if (this.state.type !== "data")
      throw new Error(`Invalid state`)

    this.input.enqueue(record.fragment.bytes)
  }

  private async onHandshake(record: PlaintextRecord<Opaque>) {
    if (this.state.type !== "handshake")
      throw new Error(`Invalid state`)

    const binary = new Binary(record.fragment.bytes)
    const header = HandshakeHeader.read(binary, binary.view.length)
    const fragment = Opaque.read(binary, header.length)
    const handshake = Handshake.from(header, fragment)

    if (handshake.subtype !== Handshake.types.hello_request)
      this.state.messages.push(new Uint8Array(record.fragment.bytes))

    if (handshake.subtype === ServerHello2.type)
      return this.onServerHello(handshake, this.state)
    if (handshake.subtype === Certificate2.type)
      return this.onCertificate(handshake, this.state)
    if (handshake.subtype === ServerHelloDone2.type)
      return this.onServerHelloDone(handshake, this.state)
    if (handshake.subtype === ServerKeyExchange2None.type)
      return this.onServerKeyExchange(handshake, this.state)
    if (handshake.subtype === CertificateRequest2.type)
      return this.onCertificateRequest(handshake, this.state)
    if (handshake.subtype === Finished2.type)
      return this.onFinished(handshake, this.state)

    console.warn(handshake)
  }

  private async onServerHello(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "client_hello")
      throw new Error(`Invalid state`)

    const server_hello = handshake.fragment.into<ServerHello2>(ServerHello2)

    console.log(server_hello)

    const version = server_hello.server_version

    if (version !== 0x0303)
      throw new Error(`Unsupported ${version} version`)

    const cipher = this.params.ciphers.find(it => it.id === server_hello.cipher_suite)

    if (cipher === undefined)
      throw new Error(`Unsupported ${server_hello.cipher_suite} cipher suite`)

    const server_random = server_hello.random.export()

    this.state = { ...state, step: "server_hello", version, cipher, server_random }
  }

  private async onCertificate(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new Error(`Invalid state`)

    const certificate = handshake.fragment.into<Certificate2>(Certificate2)

    console.log(certificate)

    const server_certificates = certificate.certificate_list.array
      .map(it => X509.Certificate.fromBytes(it.bytes))

    this.state = { ...state, action: "server_certificate", server_certificates }

    // console.log(server_certificates)
    // console.log(server_certificates.map(it => it.tbsCertificate.issuer.toX501()))
    // console.log(server_certificates.map(it => it.tbsCertificate.subject.toX501()))
  }

  private async onServerKeyExchange(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new Error(`Invalid state`)

    const clazz = getServerKeyExchange2(state.cipher)

    const server_key_exchange = handshake.fragment.into<InstanceType<typeof clazz>>(clazz)

    if (server_key_exchange instanceof ServerKeyExchange2Ephemeral) {
      console.log(server_key_exchange)

      const server_dh_params = server_key_exchange.params

      this.state = { ...state, action: "server_key_exchange", server_dh_params }

      return
    }

    console.warn(server_key_exchange)
  }

  private async onCertificateRequest(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new Error(`Invalid state`)

    const certificate_request = handshake.fragment.into<CertificateRequest2>(CertificateRequest2)

    console.log(certificate_request)

    this.state = { ...state, action: "server_certificate_request", certificate_request }
  }

  private async computeDiffieHellman(state: ServerKeyExchangeHandshakeState) {
    const { dh_g, dh_p, dh_Ys } = state.server_dh_params

    const g = BigInt(`0x${Bytes.toHex(dh_g.bytes)}`)
    const p = BigInt(`0x${Bytes.toHex(dh_p.bytes)}`)
    const Ys = BigInt(`0x${Bytes.toHex(dh_Ys.bytes)}`)

    const dh_yc = Bytes.random(dh_p.bytes.length)

    const yc = BigInt(`0x${Bytes.toHex(dh_yc)}`)

    const Yc = BigMath.umodpow(g, yc, p)
    const Z = BigMath.umodpow(Ys, yc, p)

    const dh_Yc = Bytes.fromHexSafe(Yc.toString(16))
    const dh_Z = Bytes.fromHexSafe(Z.toString(16))

    return { dh_Yc, dh_Z }
  }

  private async computeSecrets(state: ServerKeyExchangeHandshakeState, premaster_secret: Uint8Array) {
    const { cipher, client_random, server_random } = state
    const { prf_md } = state.cipher.hash

    // console.log("premaster_secret", premaster_secret.length, Bytes.toHex(premaster_secret))

    const master_secret_seed = Bytes.concat([client_random, server_random])
    const master_secret = await PRF(prf_md, premaster_secret, "master secret", master_secret_seed, 48)

    // console.log("master_secret", master_secret.length, Bytes.toHex(master_secret))

    const key_block_length = 0
      + (2 * cipher.hash.mac_key_length)
      + (2 * cipher.encryption.enc_key_length)
      + (2 * cipher.encryption.fixed_iv_length)

    const key_block_seed = Bytes.concat([server_random, client_random])
    const key_block = await PRF(prf_md, master_secret, "key expansion", key_block_seed, key_block_length)

    // console.log("key_block", key_block.length, Bytes.toHex(key_block))

    const key_block_binary = new Binary(key_block)

    const mac_key_length = state.cipher.encryption.cipher_type === "block"
      ? cipher.hash.mac.mac_key_length
      : 0

    const client_write_MAC_key = key_block_binary.read(mac_key_length)
    const server_write_MAC_key = key_block_binary.read(mac_key_length)

    // console.log("client_write_MAC_key", client_write_MAC_key.length, Bytes.toHex(client_write_MAC_key))
    // console.log("server_write_MAC_key", server_write_MAC_key.length, Bytes.toHex(server_write_MAC_key))

    const client_write_key = key_block_binary.read(cipher.encryption.enc_key_length)
    const server_write_key = key_block_binary.read(cipher.encryption.enc_key_length)

    // console.log("client_write_key", client_write_key.length, Bytes.toHex(client_write_key))
    // console.log("server_write_key", server_write_key.length, Bytes.toHex(server_write_key))

    const client_write_IV = key_block_binary.read(cipher.encryption.fixed_iv_length)
    const server_write_IV = key_block_binary.read(cipher.encryption.fixed_iv_length)

    // console.log("client_write_IV", client_write_IV.length, Bytes.toHex(client_write_IV))
    // console.log("server_write_IV", server_write_IV.length, Bytes.toHex(server_write_IV))

    return {
      master_secret,
      client_write_MAC_key,
      server_write_MAC_key,
      client_write_key,
      server_write_key,
      client_write_IV,
      server_write_IV
    } satisfies Secrets
  }

  private async onServerHelloDone(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new Error(`Invalid state`)

    const server_hello_done = handshake.fragment.into<ServerHelloDone2>(ServerHelloDone2)

    console.log(server_hello_done)

    if ("certificate_request" in state) {
      const certificate_list = ArrayVector(Number24, BytesVector(Number24)).from([])

      const certificate = new Certificate2(certificate_list)
      const handshake_certificate = certificate.handshake()
      const record_certificate = handshake_certificate.record(state.version)

      state.messages.push(handshake_certificate.export())

      this.output.enqueue(record_certificate.export())
    }

    if (!("server_dh_params" in state))
      throw new Error(`Invalid state`)

    const { dh_Yc, dh_Z } = await this.computeDiffieHellman(state)

    const dh_yc_vector = BytesVector(Number16).from(dh_Yc)
    const dh_public = new ClientDiffieHellmanPublicExplicit(dh_yc_vector)

    const client_key_exchange = new ClientKeyExchange2DH(dh_public)
    const handshake_client_key_exchange = client_key_exchange.handshake()
    const record_client_key_exchange = handshake_client_key_exchange.record(state.version)

    state.messages.push(handshake_client_key_exchange.export())

    this.output.enqueue(record_client_key_exchange.export())

    const secrets = await this.computeSecrets(state, dh_Z)
    const encrypter = await state.cipher.init(secrets)

    const change_cipher_spec = new ChangeCipherSpec()
    const record_change_cipher_spec = change_cipher_spec.record(state.version)

    state = { ...state, step: "client_change_cipher_spec", encrypter, client_encrypted: true, client_sequence: BigInt(0) }

    this.output.enqueue(record_change_cipher_spec.export())

    const { handshake_md, prf_md } = state.cipher.hash

    const handshake_messages = Bytes.concat(state.messages)
    const handshake_messages_hash = new Uint8Array(await crypto.subtle.digest(handshake_md, handshake_messages))

    const verify_data = await PRF(prf_md, secrets.master_secret, "client finished", handshake_messages_hash, 12)
    const finished = new Finished2(verify_data).handshake().record(state.version)
    const cfinished = await finished.encrypt(state.encrypter, state.client_sequence++)

    state = { ...state, step: "client_finished" }

    this.output.enqueue(cfinished.export())

    this.state = state
  }

  private async onFinished(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_change_cipher_spec")
      throw new Error(`Invalid state`)

    console.log("Finished", handshake)

    this.state = { ...state, type: "data" }

    this.dispatchEvent(new Event("finished"))
  }
}