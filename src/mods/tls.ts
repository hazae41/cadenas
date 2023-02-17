import { Cursor, Opaque, Writable } from "@hazae41/binary"
import { Bytes } from "@hazae41/bytes"
import { Certificate, X509 } from "@hazae41/x509"
import { BigMath } from "libs/bigmath/index.js"
import { AbortEvent } from "libs/events/abort.js"
import { CloseEvent } from "libs/events/close.js"
import { ErrorEvent } from "libs/events/error.js"
import { AsyncEventTarget } from "libs/events/target.js"
import { Future } from "libs/futures/future.js"
import { PRF } from "mods/algorithms/prf/prf.js"
import { List } from "mods/binary/lists/writable.js"
import { Number24 } from "mods/binary/numbers/number24.js"
import { Alert } from "mods/binary/records/alerts/alert.js"
import { ChangeCipherSpec } from "mods/binary/records/change_cipher_spec/change_cipher_spec.js"
import { Certificate2 } from "mods/binary/records/handshakes/certificate/certificate2.js"
import { CertificateRequest2 } from "mods/binary/records/handshakes/certificate_request/certificate_request2.js"
import { ClientHello2 } from "mods/binary/records/handshakes/client_hello/client_hello2.js"
import { ClientKeyExchange2DH } from "mods/binary/records/handshakes/client_key_exchange/client_key_exchange2_dh.js"
import { Finished2 } from "mods/binary/records/handshakes/finished/finished2.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ServerHello2 } from "mods/binary/records/handshakes/server_hello/server_hello2.js"
import { ServerHelloDone2 } from "mods/binary/records/handshakes/server_hello_done/server_hello_done2.js"
import { ServerDHParams } from "mods/binary/records/handshakes/server_key_exchange/server_dh_params.js"
import { AEADCiphertextRecord, BlockCiphertextRecord, PlaintextRecord, Record } from "mods/binary/records/record.js"
import { Vector } from "mods/binary/vectors/writable.js"
import { Cipher } from "mods/ciphers/cipher.js"
import { Encrypter } from "mods/ciphers/encryptions/encryption.js"
import { Secrets } from "mods/ciphers/secrets.js"
import { ClientKeyExchange2ECDH } from "./binary/records/handshakes/client_key_exchange/client_key_exchange2_ecdh.js"
import { ServerECDHParams } from "./binary/records/handshakes/server_key_exchange/server_ecdh_params.js"
import { getServerKeyExchange2 } from "./binary/records/handshakes/server_key_exchange/server_key_exchange2.js"
import { ServerKeyExchange2DHSigned } from "./binary/records/handshakes/server_key_exchange/server_key_exchange2_dh_signed.js"
import { ServerKeyExchange2ECDHSigned } from "./binary/records/handshakes/server_key_exchange/server_key_exchange2_ecdh_signed.js"
import { ExtensionRecord, getClientExtensionRecord, getServerExtensionRecord } from "./extensions.js"

export type State =
  | NoneState
  | HandshakeState
  | HandshakedState

export interface NoneState {
  type: "none"
  client_encrypted: false
  server_encrypted: false
}

export type HandshakeState =
  | ClientHelloState
  | ServerHelloState
  | ServerCertificateState
  | ServerKeyExchangeState
  | ServerCertificateRequestState
  | ClientCertificateState
  | ClientChangeCipherSpecState
  | ClientFinishedState
  | ServerChangeCipherSpecState

export type ClientHelloData = {
  messages: Uint8Array[]
  client_random: Uint8Array
  client_extensions: ExtensionRecord
}

export type ClientHelloState = ClientHelloData & {
  type: "handshake"
  step: "client_hello"
  client_encrypted: false
  server_encrypted: false
}

export type ServerHelloData = ClientHelloData & {
  version: number
  cipher: Cipher
  server_random: Uint8Array
  server_extensions: ExtensionRecord
}

export type ServerHelloState = ServerHelloData & {
  type: "handshake"
  step: "server_hello"
  client_encrypted: false
  server_encrypted: false
}

export type ServerCertificateData = ServerHelloData & {
  server_certificates: Certificate[]
}

export type ServerCertificateState = ServerCertificateData & {
  type: "handshake"
  step: "server_hello"
  action: "server_certificate"
  client_encrypted: false
  server_encrypted: false
}

export type ServerKeyExchangeDHData = ServerHelloData & {
  server_dh_params: ServerDHParams
}

export type ServerKeyExchangeECDHData = ServerHelloData & {
  server_ecdh_params: ServerECDHParams
}

export type ServerKeyExchangeData =
  | ServerKeyExchangeDHData
  | ServerKeyExchangeECDHData

export type ServerKeyExchangeState = ServerKeyExchangeData & {
  type: "handshake"
  step: "server_hello"
  action: "server_key_exchange"
  client_encrypted: false
  server_encrypted: false
}

export type ServerCertificateRequestData = ServerHelloData & {
  certificate_request: CertificateRequest2
}

export type ServerCertificateRequestState = ServerCertificateRequestData & {
  type: "handshake"
  step: "server_hello"
  action: "server_certificate_request"
  client_encrypted: false
  server_encrypted: false
}

export type ClientCertificateData = ServerKeyExchangeData & {}

export type ClientCertificateState = ClientCertificateData & {
  type: "handshake"
  step: "client_finish"
  action: "client_certificate"
  client_encrypted: false
  server_encrypted: false
}

export type ClientChangeCipherSpecData = ServerHelloData & {
  encrypter: Encrypter
  client_sequence: bigint
}

export type ClientChangeCipherSpecState = ClientChangeCipherSpecData & {
  type: "handshake"
  step: "client_change_cipher_spec"
  client_encrypted: true
  server_encrypted: false
}

export type ClientFinishedData = ClientChangeCipherSpecData & {}

export type ClientFinishedState = ClientFinishedData & {
  type: "handshake"
  step: "client_finished"
  client_encrypted: true
  server_encrypted: false
}

export type ServerChangeCipherSpecData = ClientFinishedData & {
  server_sequence: bigint
}

export type ServerChangeCipherSpecState = ServerChangeCipherSpecData & {
  type: "handshake"
  step: "server_change_cipher_spec"
  client_encrypted: true
  server_encrypted: true
}

export type HandshakedData = ServerChangeCipherSpecData & {}

export type HandshakedState = HandshakedData & {
  type: "handshaked"
  client_encrypted: true
  server_encrypted: true
}

export interface TlsParams {
  ciphers: Cipher[]
  signal?: AbortSignal
}

export class TlsStream extends AsyncEventTarget {
  readonly #class = TlsStream

  readonly read = new AsyncEventTarget()
  readonly write = new AsyncEventTarget()

  readonly readable: ReadableStream<Uint8Array>
  readonly writable: WritableStream<Uint8Array>

  #reader: TransformStream<Uint8Array>
  #writer: TransformStream<Uint8Array>
  #piper: TransformStream<Uint8Array>

  #input?: TransformStreamDefaultController<Uint8Array>
  #output?: TransformStreamDefaultController<Uint8Array>

  #buffer = Cursor.allocUnsafe(65535)

  #state: State = { type: "none", client_encrypted: false, server_encrypted: false }

  constructor(
    readonly substream: ReadableWritablePair<Uint8Array>,
    readonly params: TlsParams
  ) {
    super()

    const { signal } = params

    this.#reader = new TransformStream<Uint8Array>({
      start: this.#onReadStart.bind(this),
      transform: this.#onRead.bind(this),
    })

    this.#writer = new TransformStream<Uint8Array>({
      start: this.#onWriteStart.bind(this),
      transform: this.#onWrite.bind(this),
    })

    this.#piper = new TransformStream<Uint8Array>()

    this.readable = this.#piper.readable
    this.writable = this.#writer.writable

    substream.readable
      .pipeTo(this.#reader.writable, { signal })
      .then(this.#onReadClose.bind(this))
      .catch(this.#onReadError.bind(this))

    this.#writer.readable
      .pipeTo(substream.writable, { signal })
      .then(this.#onWriteClose.bind(this))
      .catch(this.#onWriteError.bind(this))

    this.#reader.readable
      .pipeTo(this.#piper.writable)
      .then(() => { })
      .catch(() => { })
  }

  async #onReadClose() {
    // console.debug(`${this.#class.name}.onReadClose`)

    const closeEvent = new CloseEvent("close", {})
    if (!await this.read.dispatchEvent(closeEvent)) return
  }

  async #onWriteClose() {
    // console.debug(`${this.#class.name}.onWriteClose`)

    const closeEvent = new CloseEvent("close", {})
    if (!await this.write.dispatchEvent(closeEvent)) return
  }

  async #onReadError(error?: unknown) {
    // console.debug(`${this.#class.name}.onReadError`, error)

    const errorEvent = new ErrorEvent("error", { error })
    if (!await this.read.dispatchEvent(errorEvent)) return
  }

  async #onWriteError(error?: unknown) {
    // console.debug(`${this.#class.name}.onWriteError`, error)

    const errorEvent = new ErrorEvent("error", { error })
    if (!await this.write.dispatchEvent(errorEvent)) return
  }

  async #onReadStart(controller: TransformStreamDefaultController<Uint8Array>) {
    this.#input = controller
  }

  async #onWriteStart(controller: TransformStreamDefaultController<Uint8Array>) {
    this.#output = controller
  }

  async handshake(signal?: AbortSignal) {
    if (this.#state.type !== "none")
      throw new Error(`Invalid state`)

    let state: State = this.#state

    const client_hello = ClientHello2.default(this.params.ciphers)

    const client_random = Writable.toBytes(client_hello.random)
    const client_extensions = getClientExtensionRecord(client_hello)

    const state2: ClientHelloState = { ...state, type: "handshake", messages: [], step: "client_hello", client_random, client_extensions }

    const handshake = client_hello.handshake()
    state2.messages.push(Writable.toBytes(handshake))

    this.#state = state2

    const record = handshake.record(0x0301)
    this.#output!.enqueue(Writable.toBytes(record))

    const future = new Future<Event, Error>()

    const onAbort = (event: Event) => {
      const abortEvent = event as AbortEvent
      const error = new Error(`Aborted`, { cause: abortEvent.target.reason })
      future.err(error)
    }

    const onClose = (event: Event) => {
      const closeEvent = event as CloseEvent
      const error = new Error(`Closed`, { cause: closeEvent })
      future.err(error)
    }

    const onError = (event: Event) => {
      const errorEvent = event as ErrorEvent
      const error = new Error(`Errored`, { cause: errorEvent })
      future.err(error)
    }

    try {
      signal?.addEventListener("abort", onAbort, { passive: true })
      this.read.addEventListener("close", onClose, { passive: true })
      this.read.addEventListener("error", onError, { passive: true })
      this.addEventListener("finished", future.ok, { passive: true })

      await future.promise
    } finally {
      signal?.removeEventListener("abort", onAbort)
      this.read.removeEventListener("close", onClose)
      this.read.removeEventListener("error", onError)
      this.removeEventListener("finished", future.ok)
    }
  }

  async #onRead(chunk: Uint8Array) {
    console.debug(this.#class.name, "<-", chunk)

    if (this.#buffer.offset)
      await this.#onReadBuffered(chunk)
    else
      await this.#onReadDirect(chunk)
  }

  /**
   * Read from buffer
   * @param chunk 
   * @returns 
   */
  async #onReadBuffered(chunk: Uint8Array) {
    this.#buffer.write(chunk)
    const full = this.#buffer.before

    this.#buffer.offset = 0
    await this.#onReadDirect(full)
  }

  /**
   * Zero-copy reading
   * @param chunk 
   * @returns 
   */
  async #onReadDirect(chunk: Uint8Array) {
    const cursor = new Cursor(chunk)

    while (cursor.remaining) {
      const record = PlaintextRecord.tryRead(cursor)

      if (!record) {
        this.#buffer.write(cursor.after)
        break
      }

      await this.#onRecord(record, this.#state)
    }
  }

  async #onWrite(chunk: Uint8Array) {
    if (this.#state.type !== "handshaked")
      throw new Error(`Invalid state`)
    const state = this.#state

    const { version, encrypter } = state
    const type = Record.types.application_data
    const fragment = new Opaque(chunk)

    const plaintext = new PlaintextRecord(type, version, fragment)
    const ciphertext = await plaintext.encrypt(encrypter, state.client_sequence++)

    this.#output!.enqueue(Writable.toBytes(ciphertext))
  }

  async #onRecord(record: PlaintextRecord<Opaque>, state: State) {
    if (state.server_encrypted)
      return await this.#onCiphertextRecord(record, state)

    return await this.#onPlaintextRecord(record, state)
  }

  async #onCiphertextRecord(record: PlaintextRecord<Opaque>, state: State & { server_encrypted: true }) {
    if (state.encrypter.cipher_type === "block") {
      const cipher = BlockCiphertextRecord.from(record)
      const plain = await cipher.decrypt(state.encrypter, state.server_sequence++)
      return await this.#onPlaintextRecord(plain, state)
    }

    if (state.encrypter.cipher_type === "aead") {
      const cipher = AEADCiphertextRecord.from(record)
      const plain = await cipher.decrypt(state.encrypter, state.server_sequence++)
      return await this.#onPlaintextRecord(plain, state)
    }

    throw new Error(`Invalid cipher type`)
  }

  async #onPlaintextRecord(record: PlaintextRecord<Opaque>, state: State) {
    if (record.subtype === Alert.type)
      return await this.#onAlert(record, state)
    if (record.subtype === Handshake.type)
      return await this.#onHandshake(record, state)
    if (record.subtype === ChangeCipherSpec.type)
      return await this.#onChangeCipherSpec(record, state)
    if (record.subtype === Record.types.application_data)
      return await this.#onApplicationData(record, state)

    console.warn(record)
  }

  async #onAlert(record: PlaintextRecord<Opaque>, state: State) {
    const alert = record.fragment.into(Alert)

    console.debug(alert)

    if (alert.description === Alert.descriptions.close_notify) {
      this.#input!.terminate()
      return
    }

    if (alert.level === Alert.levels.fatal)
      throw new Error(`Fatal alert ${alert.description}`)

    console.warn(`Warning alert ${alert.description}`)
  }

  async #onChangeCipherSpec(record: PlaintextRecord<Opaque>, state: State) {
    if (state.type !== "handshake")
      throw new Error(`Invalid state`)
    if (state.step !== "client_finished")
      throw new Error(`Invalid state`)

    const change_cipher_spec = record.fragment.into(ChangeCipherSpec)

    console.debug(change_cipher_spec)

    const state2: ServerChangeCipherSpecState = { ...state, step: "server_change_cipher_spec", server_encrypted: true, server_sequence: BigInt(0) }

    this.#state = state2
  }

  async #onApplicationData(record: PlaintextRecord<Opaque>, state: State) {
    if (state.type !== "handshaked")
      throw new Error(`Invalid state`)

    this.#input!.enqueue(record.fragment.bytes)
  }

  async #onHandshake(record: PlaintextRecord<Opaque>, state: State) {
    if (state.type !== "handshake")
      throw new Error(`Invalid state`)

    const handshake = record.fragment.into(Handshake)

    if (handshake.subtype !== Handshake.types.hello_request)
      state.messages.push(new Uint8Array(record.fragment.bytes))

    if (handshake.subtype === ServerHello2.type)
      return this.#onServerHello(handshake, state)
    if (handshake.subtype === Certificate2.type)
      return this.#onCertificate(handshake, state)
    if (handshake.subtype === ServerHelloDone2.type)
      return this.#onServerHelloDone(handshake, state)
    if (handshake.subtype === Handshake.types.server_key_exchange)
      return this.#onServerKeyExchange(handshake, state)
    if (handshake.subtype === CertificateRequest2.type)
      return this.#onCertificateRequest(handshake, state)
    if (handshake.subtype === Finished2.type)
      return this.#onFinished(handshake, state)

    console.warn(handshake)
  }

  async #onServerHello(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "client_hello")
      throw new Error(`Invalid state`)

    const server_hello = handshake.fragment.into(ServerHello2)

    console.debug(server_hello)

    const version = server_hello.server_version

    if (version !== 0x0303)
      throw new Error(`Unsupported ${version} version`)

    const cipher = this.params.ciphers.find(it => it.id === server_hello.cipher_suite)

    if (cipher === undefined)
      throw new Error(`Unsupported ${server_hello.cipher_suite} cipher suite`)

    const server_random = Writable.toBytes(server_hello.random)
    const server_extensions = getServerExtensionRecord(server_hello, state.client_extensions)

    console.debug(server_extensions)

    const state2: ServerHelloState = { ...state, step: "server_hello", version, cipher, server_random, server_extensions }

    this.#state = state2
  }

  async #onCertificate(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new Error(`Invalid state`)

    const certificate = handshake.fragment.into(Certificate2)

    console.debug(certificate)

    const server_certificates = certificate.certificate_list.value.array
      .map(it => X509.Certificate.fromBytes(it.value.bytes))

    // console.debug(server_certificates)
    // console.debug(server_certificates.map(it => it.tbsCertificate.issuer.toX501()))
    // console.debug(server_certificates.map(it => it.tbsCertificate.subject.toX501()))

    const state2: ServerCertificateState = { ...state, action: "server_certificate", server_certificates }

    this.#state = state2
  }

  async #onServerKeyExchange(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new Error(`Invalid state`)

    const clazz = getServerKeyExchange2(state.cipher)

    const server_key_exchange = handshake.fragment.into<InstanceType<typeof clazz>>(clazz)

    if (server_key_exchange instanceof ServerKeyExchange2DHSigned) {
      console.debug(server_key_exchange)

      const server_dh_params = server_key_exchange.params

      const state2: ServerKeyExchangeState = { ...state, action: "server_key_exchange", server_dh_params }

      this.#state = state2

      return
    }

    if (server_key_exchange instanceof ServerKeyExchange2ECDHSigned) {
      console.debug(server_key_exchange)

      const server_ecdh_params = server_key_exchange.params

      const state2: ServerKeyExchangeState = { ...state, action: "server_key_exchange", server_ecdh_params }

      this.#state = state2

      return
    }

    console.warn(server_key_exchange)
  }

  async #onCertificateRequest(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new Error(`Invalid state`)

    const certificate_request = handshake.fragment.into(CertificateRequest2)

    console.debug(certificate_request)

    const state2: ServerCertificateRequestState = { ...state, action: "server_certificate_request", certificate_request }

    this.#state = state2
  }

  async #computeDiffieHellman(state: ServerKeyExchangeState & { server_dh_params: ServerDHParams }) {
    const { dh_g, dh_p, dh_Ys } = state.server_dh_params

    const g = Bytes.toBigInt(dh_g.value.bytes)
    const p = Bytes.toBigInt(dh_p.value.bytes)
    const Ys = Bytes.toBigInt(dh_Ys.value.bytes)

    const dh_yc = Bytes.random(dh_p.value.bytes.length)

    const yc = Bytes.toBigInt(dh_yc)

    const Yc = BigMath.umodpow(g, yc, p)
    const Z = BigMath.umodpow(Ys, yc, p)

    const dh_Yc = Bytes.fromBigInt(Yc)
    const dh_Z = Bytes.fromBigInt(Z)

    return { dh_Yc, dh_Z }
  }

  async #computeSecrets(state: ServerKeyExchangeState, premaster_secret: Uint8Array) {
    const { cipher, client_random, server_random } = state
    const { prf_md } = state.cipher.hash

    // console.debug("premaster_secret", premaster_secret.length, Bytes.toHex(premaster_secret))

    const master_secret_seed = Bytes.concat([client_random, server_random])
    const master_secret = await PRF(prf_md, premaster_secret, "master secret", master_secret_seed, 48)

    // console.debug("master_secret", master_secret.length, Bytes.toHex(master_secret))

    const key_block_length = 0
      + (2 * cipher.hash.mac_key_length)
      + (2 * cipher.encryption.enc_key_length)
      + (2 * cipher.encryption.fixed_iv_length)

    const key_block_seed = Bytes.concat([server_random, client_random])
    const key_block = await PRF(prf_md, master_secret, "key expansion", key_block_seed, key_block_length)

    // console.debug("key_block", key_block.length, Bytes.toHex(key_block))

    const key_block_cursor = new Cursor(key_block)

    const mac_key_length = state.cipher.encryption.cipher_type === "block"
      ? cipher.hash.mac.mac_key_length
      : 0

    const client_write_MAC_key = key_block_cursor.read(mac_key_length)
    const server_write_MAC_key = key_block_cursor.read(mac_key_length)

    // console.debug("client_write_MAC_key", client_write_MAC_key.length, Bytes.toHex(client_write_MAC_key))
    // console.debug("server_write_MAC_key", server_write_MAC_key.length, Bytes.toHex(server_write_MAC_key))

    const client_write_key = key_block_cursor.read(cipher.encryption.enc_key_length)
    const server_write_key = key_block_cursor.read(cipher.encryption.enc_key_length)

    // console.debug("client_write_key", client_write_key.length, Bytes.toHex(client_write_key))
    // console.debug("server_write_key", server_write_key.length, Bytes.toHex(server_write_key))

    const client_write_IV = key_block_cursor.read(cipher.encryption.fixed_iv_length)
    const server_write_IV = key_block_cursor.read(cipher.encryption.fixed_iv_length)

    // console.debug("client_write_IV", client_write_IV.length, Bytes.toHex(client_write_IV))
    // console.debug("server_write_IV", server_write_IV.length, Bytes.toHex(server_write_IV))

    // if (key_block_cursor.remaining)
    //   throw new Error(`Remaining bytes in key_block_cursor`)

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

  async #onServerHelloDone(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new Error(`Invalid state`)

    const server_hello_done = handshake.fragment.into(ServerHelloDone2)

    console.debug(server_hello_done)

    if ("certificate_request" in state) {
      const certificate_list = Vector(Number24).from(List.from<Vector<Number24, Opaque>>([]))

      const certificate = new Certificate2(certificate_list)
      const handshake_certificate = certificate.handshake()
      const record_certificate = handshake_certificate.record(state.version)

      state.messages.push(Writable.toBytes(handshake_certificate))
      this.#output!.enqueue(Writable.toBytes(record_certificate))
    }

    let secrets: Secrets

    if ("server_dh_params" in state) {
      const { dh_Yc, dh_Z } = await this.#computeDiffieHellman(state)

      const handshake_client_key_exchange = ClientKeyExchange2DH.from(dh_Yc).handshake()
      const record_client_key_exchange = handshake_client_key_exchange.record(state.version)

      state.messages.push(Writable.toBytes(handshake_client_key_exchange))
      this.#output!.enqueue(Writable.toBytes(record_client_key_exchange))

      secrets = await this.#computeSecrets(state, dh_Z)
    }

    else if ("server_ecdh_params" in state) {
      const yc = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"])
      const ecdh_Yc = new Uint8Array(await crypto.subtle.exportKey("raw", yc.publicKey))

      const handshake_client_key_exchange = ClientKeyExchange2ECDH.from(ecdh_Yc).handshake()
      const record_client_key_exchange = handshake_client_key_exchange.record(state.version)

      state.messages.push(Writable.toBytes(handshake_client_key_exchange))
      this.#output!.enqueue(Writable.toBytes(record_client_key_exchange))

      const ecdh_Ys = state.server_ecdh_params.public_point.point.value.bytes
      const Ys = await crypto.subtle.importKey("raw", ecdh_Ys, { name: "ECDH", namedCurve: "P-256" }, false, [])
      const ecdh_Z = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: Ys }, yc.privateKey, 256))

      secrets = await this.#computeSecrets(state, ecdh_Z)
    }

    else throw new Error(`Invalid state`)

    const encrypter = await state.cipher.init(secrets)

    const change_cipher_spec = new ChangeCipherSpec()
    const record_change_cipher_spec = change_cipher_spec.record(state.version)

    const state2: ClientChangeCipherSpecState = { ...state, step: "client_change_cipher_spec", encrypter, client_encrypted: true, client_sequence: BigInt(0) }

    this.#state = state2

    this.#output!.enqueue(Writable.toBytes(record_change_cipher_spec))

    const { handshake_md, prf_md } = state2.cipher.hash

    const handshake_messages = Bytes.concat(state2.messages)
    const handshake_messages_hash = new Uint8Array(await crypto.subtle.digest(handshake_md, handshake_messages))

    const verify_data = await PRF(prf_md, secrets.master_secret, "client finished", handshake_messages_hash, 12)
    const finished = new Finished2(verify_data).handshake().record(state.version)
    const cfinished = await finished.encrypt(state2.encrypter, state2.client_sequence++)

    this.#output!.enqueue(Writable.toBytes(cfinished))

    const state3: ClientFinishedState = { ...state2, step: "client_finished" }

    this.#state = state3

    return
  }

  async #onFinished(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_change_cipher_spec")
      throw new Error(`Invalid state`)

    const finished = handshake.fragment.into(Finished2)

    console.debug(finished)

    const state2: HandshakedState = { ...state, type: "handshaked" }

    this.#state = state2

    await this.dispatchEvent(new Event("finished"))
  }
}