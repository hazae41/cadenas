import "@hazae41/symbol-dispose-polyfill"

import { IA5String } from "@hazae41/asn1"
import { Base16 } from "@hazae41/base16"
import { Opaque, Readable, Writable } from "@hazae41/binary"
import { Bytes } from "@hazae41/bytes"
import { SuperTransformStream } from "@hazae41/cascade"
import { Cursor } from "@hazae41/cursor"
import { Future } from "@hazae41/future"
import { None } from "@hazae41/option"
import { CloseEvents, ErrorEvents, Plume, SuperEventTarget } from "@hazae41/plume"
import { Err, Ok, Panic, Result } from "@hazae41/result"
import { OIDs, SubjectAltName, X509 } from "@hazae41/x509"
import { BigInts } from "libs/bigint/bigint.js"
import { BigMath } from "libs/bigmath/index.js"
import { prfOrThrow } from "mods/algorithms/prf/prf.js"
import { List } from "mods/binary/lists/writable.js"
import { Number24 } from "mods/binary/numbers/number24.js"
import { Alert } from "mods/binary/records/alerts/alert.js"
import { ChangeCipherSpec } from "mods/binary/records/change_cipher_spec/change_cipher_spec.js"
import { Certificate2 } from "mods/binary/records/handshakes/certificate/certificate2.js"
import { CertificateRequest2 } from "mods/binary/records/handshakes/certificate_request/certificate_request2.js"
import { ClientHello2 } from "mods/binary/records/handshakes/client_hello/client_hello2.js"
import { ClientKeyExchange2DH } from "mods/binary/records/handshakes/client_key_exchange/client_key_exchange2_dh.js"
import { NamedCurve } from "mods/binary/records/handshakes/extensions/elliptic_curves/named_curve.js"
import { Finished2 } from "mods/binary/records/handshakes/finished/finished2.js"
import { Handshake } from "mods/binary/records/handshakes/handshake.js"
import { ServerHello2 } from "mods/binary/records/handshakes/server_hello/server_hello2.js"
import { ServerHelloDone2 } from "mods/binary/records/handshakes/server_hello_done/server_hello_done2.js"
import { ServerDHParams } from "mods/binary/records/handshakes/server_key_exchange/server_dh_params.js"
import { AEADCiphertextRecord, BlockCiphertextRecord, PlaintextRecord, Record } from "mods/binary/records/record.js"
import { Vector } from "mods/binary/vectors/writable.js"
import { Cipher } from "mods/ciphers/cipher.js"
import { Secrets } from "mods/ciphers/secrets.js"
import { ClientKeyExchange2ECDH } from "./binary/records/handshakes/client_key_exchange/client_key_exchange2_ecdh.js"
import { ServerECDHParams } from "./binary/records/handshakes/server_key_exchange/server_ecdh_params.js"
import { ReadableServerKeyExchange2 } from "./binary/records/handshakes/server_key_exchange/server_key_exchange2.js"
import { ServerKeyExchange2DHSigned } from "./binary/records/handshakes/server_key_exchange/server_key_exchange2_dh_signed.js"
import { ServerKeyExchange2ECDHPreSigned, ServerKeyExchange2ECDHSigned } from "./binary/records/handshakes/server_key_exchange/server_key_exchange2_ecdh_signed.js"
import { HashAlgorithm } from "./binary/signatures/hash_algorithm.js"
import { SignatureAlgorithm } from "./binary/signatures/signature_algorithm.js"
import { CCADB } from "./ccadb/ccadb.js"
import { Secp256r1 } from "./ciphers/curves/secp256r1.js"
import { Console } from "./console/index.js"
import { FatalAlertError, InvalidTlsStateError, TlsClientError, UnsupportedCipherError, UnsupportedVersionError, WarningAlertError } from "./errors.js"
import { Extensions } from "./extensions.js"
import { ClientChangeCipherSpecState, HandshakeState, ServerCertificateState, ServerKeyExchangeState, TlsClientDuplexState } from "./state.js"


export interface TlsClientDuplexParams {
  ciphers: Cipher[]
  host_name: string
}

export type TlsClientDuplexReadEvents = CloseEvents & ErrorEvents & {
  certificates: (certificates: X509.Certificate[]) => Result<void, Error>
  handshaked: () => void
}

export class TlsClientDuplex {
  readonly #class = TlsClientDuplex

  readonly events = {
    input: new SuperEventTarget<TlsClientDuplexReadEvents>(),
    output: new SuperEventTarget<CloseEvents & ErrorEvents>()
  } as const

  readonly #input: SuperTransformStream<Opaque, Opaque>
  readonly #output: SuperTransformStream<Writable, Writable>

  readonly inner: ReadableWritablePair<Writable, Opaque>
  readonly outer: ReadableWritablePair<Opaque, Writable>

  #buffer = new Cursor(Bytes.alloc(65_535))

  #state: TlsClientDuplexState = { type: "none", client_encrypted: false, server_encrypted: false }

  constructor(
    readonly params: TlsClientDuplexParams
  ) {
    /**
     * Input pipeline (outer <- inner) (client <- server)
     */
    this.#input = new SuperTransformStream({
      transform: this.#onInputTransform.bind(this)
    })

    /**
     * Output pipeline (outer -> inner) (client -> server)
     */
    this.#output = new SuperTransformStream({
      start: this.#onOutputStart.bind(this),
      transform: this.#onOutputTransform.bind(this)
    })

    const preInputer = this.#input.start()
    const preOutputer = this.#output.start()

    const postInputer = new TransformStream<Opaque, Opaque>({})
    const postOutputer = new TransformStream<Writable, Writable>({})

    /**
     * Inner protocol (TCP?)
     */
    this.inner = {
      readable: postOutputer.readable,
      writable: preInputer.writable
    }

    /**
     * Outer protocol (HTTP?)
     */
    this.outer = {
      readable: postInputer.readable,
      writable: preOutputer.writable
    }

    preInputer.readable
      .pipeTo(postInputer.writable)
      .then(() => this.#onInputClose())
      .catch(e => this.#onInputError(e))
      .catch(() => { })

    preOutputer.readable
      .pipeTo(postOutputer.writable)
      .then(() => this.#onOutputClose())
      .catch(e => this.#onOutputError(e))
      .catch(() => { })
  }

  async #onInputClose(): Promise<Ok<void>> {
    Console.debug(`${this.#class.name}.onReadClose`)

    this.#input.closed = {}

    await this.events.input.emit("close", [undefined])

    return Ok.void()
  }

  async #onOutputClose(): Promise<Ok<void>> {
    Console.debug(`${this.#class.name}.onWriteClose`)

    this.#output.closed = {}

    await this.events.output.emit("close", [undefined])

    return Ok.void()
  }

  async #onInputError(reason?: unknown) {
    Console.debug(`${this.#class.name}.onReadError`, { reason })

    this.#input.closed = { reason }
    this.#output.error(reason)

    await this.events.input.emit("error", [reason])
  }

  async #onOutputError(reason?: unknown) {
    Console.debug(`${this.#class.name}.onWriteError`, { reason })

    this.#output.closed = { reason }
    this.#input.error(reason)

    await this.events.output.emit("error", [reason])
  }

  async #onOutputStart(): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (this.#state.type !== "none")
        return new Err(new InvalidTlsStateError())

      const client_hello = ClientHello2.default(this.params.ciphers, this.params.host_name)

      const client_random = Writable.tryWriteToBytes(client_hello.random).throw(t) as Bytes<32>
      const client_extensions = Extensions.getClientExtensions(client_hello).throw(t)

      const client_hello_handshake = Handshake.from(client_hello)
      const messages = [Writable.tryWriteToBytes(client_hello_handshake).throw(t)]

      this.#state = { ...this.#state, type: "handshake", messages, step: "client_hello", client_random, client_extensions }

      const client_hello_handshake_record = PlaintextRecord.from(client_hello_handshake, 0x0301)
      this.#output.enqueue(client_hello_handshake_record)

      await Plume.tryWaitOrCloseOrError(this.events.input, "handshaked", (future: Future<Ok<void>>) => {
        future.resolve(Ok.void())
        return new None()
      }).then(r => r.throw(t))

      return Ok.void()
    })
  }

  async #onInputTransform(chunk: Opaque): Promise<Result<void, Error>> {
    // Console.debug(this.#class.name, "<-", chunk)

    if (this.#buffer.offset)
      return await this.#onReadBuffered(chunk.bytes)
    else
      return await this.#onReadDirect(chunk.bytes)
  }

  /**
   * Read from buffer
   * @param chunk 
   * @returns 
   */
  async #onReadBuffered(chunk: Uint8Array): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      this.#buffer.tryWrite(chunk).throw(t)
      const full = new Uint8Array(this.#buffer.before)

      this.#buffer.offset = 0
      return await this.#onReadDirect(full)
    })
  }

  /**
   * Zero-copy reading
   * @param chunk 
   * @returns 
   */
  async #onReadDirect(chunk: Uint8Array): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      const cursor = new Cursor(chunk)

      while (cursor.remaining) {
        const record = Readable.tryReadOrRollback(PlaintextRecord, cursor).ignore()

        if (record.isErr()) {
          this.#buffer.tryWrite(cursor.after).throw(t)
          break
        }

        await this.#onRecord(record.get(), this.#state).then(r => r.throw(t))
      }

      return Ok.void()
    })
  }

  async #onOutputTransform(chunk: Writable): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (this.#state.type !== "handshaked")
        return new Err(new InvalidTlsStateError())

      const state = this.#state

      const { version, encrypter } = state
      const type = Record.types.application_data

      const plaintext = new PlaintextRecord(type, version, chunk)
      const ciphertext = await plaintext.tryEncrypt(encrypter, state.client_sequence++).then(r => r.throw(t))

      this.#output.enqueue(ciphertext)

      return Ok.void()
    })
  }

  async #onRecord(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState): Promise<Result<void, Error>> {
    if (state.server_encrypted)
      return await this.#onCiphertextRecord(record, state)

    return await this.#onPlaintextRecord(record, state)
  }

  async #onCiphertextRecord(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState & { server_encrypted: true }): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.encrypter.cipher_type === "block") {
        const cipher = BlockCiphertextRecord.tryFrom(record).throw(t)
        const plain = await cipher.tryDecrypt(state.encrypter, state.server_sequence++)
        return await this.#onPlaintextRecord(plain.throw(t), state)
      }

      if (state.encrypter.cipher_type === "aead") {
        const cipher = AEADCiphertextRecord.tryFrom(record).throw(t)
        const plain = await cipher.tryDecrypt(state.encrypter, state.server_sequence++)
        return await this.#onPlaintextRecord(plain.throw(t), state)
      }

      throw new Panic(`Invalid cipher type`)
    })
  }

  async #onPlaintextRecord(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState): Promise<Result<void, Error>> {
    if (record.type === Alert.record_type)
      return await this.#onAlert(record, state)
    if (record.type === Handshake.record_type)
      return await this.#onHandshake(record, state)
    if (record.type === ChangeCipherSpec.record_type)
      return await this.#onChangeCipherSpec(record, state)
    if (record.type === Record.types.application_data)
      return await this.#onApplicationData(record, state)

    console.warn(record)
    return Ok.void()
  }

  async #onAlert(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      const alert = record.fragment.tryReadInto(Alert).throw(t)

      Console.debug(alert)

      if (alert.level === Alert.levels.fatal)
        return new Err(new FatalAlertError(alert))

      if (alert.description === Alert.descriptions.close_notify)
        return new Ok(this.#input.terminate())

      if (alert.level === Alert.levels.warning)
        return new Ok(console.warn(new WarningAlertError(alert)))

      console.warn(`Unknown alert level ${alert.level}`)
      return Ok.void()
    })
  }

  async #onChangeCipherSpec(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.type !== "handshake")
        return new Err(new InvalidTlsStateError())
      if (state.step !== "client_finished")
        return new Err(new InvalidTlsStateError())

      const change_cipher_spec = record.fragment.tryReadInto(ChangeCipherSpec).throw(t)

      Console.debug(change_cipher_spec)

      this.#state = { ...state, step: "server_change_cipher_spec", server_encrypted: true, server_sequence: BigInt(0) }

      return Ok.void()
    })
  }

  async #onApplicationData(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState): Promise<Result<void, TlsClientError>> {
    if (state.type !== "handshaked")
      return new Err(new InvalidTlsStateError())

    this.#input.enqueue(record.fragment)

    return Ok.void()
  }

  async #onHandshake(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.type !== "handshake")
        return new Err(new InvalidTlsStateError())

      const handshake = record.fragment.tryReadInto(Handshake).throw(t)

      if (handshake.type !== Handshake.types.hello_request)
        state.messages.push(new Uint8Array(record.fragment.bytes))

      if (handshake.type === ServerHello2.type)
        return this.#onServerHello(handshake, state)
      if (handshake.type === Certificate2.handshake_type)
        return this.#onCertificate(handshake, state)
      if (handshake.type === ServerHelloDone2.type)
        return this.#onServerHelloDone(handshake, state)
      if (handshake.type === Handshake.types.server_key_exchange)
        return this.#onServerKeyExchange(handshake, state)
      if (handshake.type === CertificateRequest2.type)
        return this.#onCertificateRequest(handshake, state)
      if (handshake.type === Finished2.handshake_type)
        return this.#onFinished(handshake, state)

      console.warn(handshake)
      return Ok.void()
    })
  }

  async #onServerHello(handshake: Handshake<Opaque>, state: HandshakeState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.step !== "client_hello")
        return new Err(new InvalidTlsStateError())

      const server_hello = handshake.fragment.tryReadInto(ServerHello2).throw(t)

      Console.debug(server_hello)

      const version = server_hello.server_version

      if (version !== 0x0303)
        return new Err(new UnsupportedVersionError(version))

      const cipher = this.params.ciphers.find(it => it.id === server_hello.cipher_suite)

      if (cipher === undefined)
        return new Err(new UnsupportedCipherError(server_hello.cipher_suite))

      const server_random = Writable.tryWriteToBytes(server_hello.random).throw(t) as Bytes<32>
      const server_extensions = Extensions.getServerExtensions(server_hello, state.client_extensions).throw(t)

      Console.debug(server_extensions)

      this.#state = { ...state, step: "server_hello", action: "server_hello", version, cipher, server_random, server_extensions }

      return Ok.void()
    })
  }

  async #onCertificate(handshake: Handshake<Opaque>, state: HandshakeState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.step !== "server_hello")
        return new Err(new InvalidTlsStateError())

      const certificate = handshake.fragment.tryReadInto(Certificate2).throw(t)

      Console.debug(certificate)

      const server_certificates = certificate.certificate_list.value.array
        .map(it => X509.tryReadAndResolveFromBytes(X509.Certificate, it.value.bytes).throw(t))

      const handled = await this.events.input.emit("certificates", [server_certificates])

      if (handled.isSome()) {
        handled.get().throw(t)
        this.#state = { ...state, action: "server_certificate", server_certificates }
        return Ok.void()
      }

      const now = new Date()

      if (server_certificates.length === 0)
        return new Err(new Error(`No certificates`))

      {
        const last = server_certificates[server_certificates.length - 1]

        const issuer = last.tbsCertificate.issuer.toX501OrThrow()
        const trusted = CCADB.trusteds[issuer]

        if (trusted == null)
          return new Err(new Error(`No matching root certificate authority`))

        const { notAfter, certHex } = trusted

        if (notAfter != null && now > new Date(notAfter))
          return new Err(new Error(`Root certificate is distrusted`))

        using certSlice = Base16.get().padStartAndDecodeOrThrow(certHex)
        const certX509 = X509.tryReadAndResolveFromBytes(X509.Certificate, certSlice.bytes).throw(t)

        server_certificates.push(certX509)
      }

      for (let i = 0; i < server_certificates.length; i++) {
        const current = server_certificates[i]
        const next = server_certificates.at(i + 1)

        if (now > current.tbsCertificate.validity.notAfter.value)
          return new Err(new Error(`Certificate is expired`))
        if (now < current.tbsCertificate.validity.notBefore.value)
          return new Err(new Error(`Certificate is not yet valid`))

        if (i === 0) {
          /**
           * Verify subjectAltName against host_name
           * @returns 
           */
          const verify = () => {
            if (current.tbsCertificate.extensions == null)
              return false

            for (const extension of current.tbsCertificate.extensions?.extensions) {
              if (extension.extnID.value.inner === OIDs.keys.subjectAltName) {
                const subjectAltName = extension.extnValue as SubjectAltName

                for (const name of subjectAltName.inner.names) {
                  if (name instanceof IA5String) {
                    if (name.value === this.params.host_name)
                      return true

                    const self = this.params.host_name.split(".")
                    const other = name.value.split(".")

                    if (self.length !== other.length)
                      continue

                    const unstarred = other.map((x, i) => {
                      if (x === "*")
                        return self[i]
                      return x
                    }).join(".")

                    if (unstarred === this.params.host_name)
                      return true
                    continue
                  }
                }
              }
            }

            return false
          }

          if (!verify()) {
            console.warn("Could not verify domain name")
          }
        }

        if (next == null)
          break

        if (current.algorithmIdentifier.algorithm.value.inner !== OIDs.keys.sha256WithRSAEncryption) {
          console.warn("Unsupported signature algorithm", current.algorithmIdentifier.algorithm.value.inner)
          continue
        }

        const signed = X509.tryWriteToBytes(current.tbsCertificate).throw(t)
        const publicKey = X509.tryWriteToBytes(next.tbsCertificate.subjectPublicKeyInfo).throw(t)

        const signatureAlgorithm = { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } }
        const signature = current.signatureValue.bytes

        const key = await crypto.subtle.importKey("spki", publicKey, signatureAlgorithm, true, ["verify"])
        const verified = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, signed)

        if (!verified)
          return new Err(new Error(`Invalid signature`))

        continue
      }

      this.#state = { ...state, action: "server_certificate", server_certificates }

      return Ok.void()
    })
  }

  async #onServerKeyExchange(handshake: Handshake<Opaque>, state: HandshakeState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.step !== "server_hello")
        return new Err(new InvalidTlsStateError())

      const clazz = ReadableServerKeyExchange2.tryGet(state.cipher).get()

      const server_key_exchange = handshake.fragment.tryReadInto(clazz).throw(t)

      if (server_key_exchange instanceof ServerKeyExchange2DHSigned) {
        Console.debug(server_key_exchange)

        const server_dh_params = server_key_exchange.params

        this.#state = { ...state, action: "server_key_exchange", server_dh_params }

        return Ok.void()
      }

      if (server_key_exchange instanceof ServerKeyExchange2ECDHSigned) {
        Console.debug(server_key_exchange)

        if (state.action !== "server_certificate")
          return new Err(new InvalidTlsStateError())

        const publicKey = X509.tryWriteToBytes(state.server_certificates[0].tbsCertificate.subjectPublicKeyInfo).throw(t)

        async function tryValidate(server_key_exchange: ServerKeyExchange2ECDHSigned, state: ServerCertificateState) {
          const { params, signed_params } = server_key_exchange

          if (signed_params.algorithm.hash.type !== HashAlgorithm.types.sha256) {
            console.warn("Unsupported hash algorithm", signed_params.algorithm.hash.type)
            return Ok.void()
          }

          if (signed_params.algorithm.signature.type !== SignatureAlgorithm.types.rsa) {
            console.warn("Unsupported signature algorithm", signed_params.algorithm.signature.type)
            return Ok.void()
          }

          const presigned = new ServerKeyExchange2ECDHPreSigned(state.client_random, state.server_random, params)
          const bytes = Writable.tryWriteToBytes(presigned).throw(t)

          const signatureAlgorithm = { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } }
          const signature = signed_params.signature.value.bytes

          const key = await crypto.subtle.importKey("spki", publicKey, signatureAlgorithm, true, ["verify"])
          const verified = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, bytes)

          if (!verified)
            return new Err(new Error(`Invalid signature`))

          return Ok.void()
        }

        await tryValidate(server_key_exchange, state).then(r => r.throw(t))

        const server_ecdh_params = server_key_exchange.params
        this.#state = { ...state, action: "server_key_exchange", server_ecdh_params }

        return Ok.void()
      }

      console.warn(server_key_exchange)
      return Ok.void()
    })
  }

  async #onCertificateRequest(handshake: Handshake<Opaque>, state: HandshakeState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.step !== "server_hello")
        return new Err(new InvalidTlsStateError())

      const certificate_request = handshake.fragment.tryReadInto(CertificateRequest2).throw(t)

      Console.debug(certificate_request)

      this.#state = { ...state, action: "server_certificate_request", certificate_request }

      return Ok.void()
    })
  }

  #tryComputeDiffieHellman(state: ServerKeyExchangeState & { server_dh_params: ServerDHParams }): Result<{ dh_Yc: Uint8Array, dh_Z: Uint8Array }, Error> {
    return Result.unthrowSync(t => {
      const { dh_g, dh_p, dh_Ys } = state.server_dh_params

      const g = BigInts.tryImport(dh_g.value.bytes).throw(t)
      const p = BigInts.tryImport(dh_p.value.bytes).throw(t)
      const Ys = BigInts.tryImport(dh_Ys.value.bytes).throw(t)

      const dh_yc = Bytes.random(dh_p.value.bytes.length)

      const yc = BigInts.tryImport(dh_yc).throw(t)

      const Yc = BigMath.umodpow(g, yc, p)
      const Z = BigMath.umodpow(Ys, yc, p)

      const dh_Yc = BigInts.tryExport(Yc).throw(t).copyAndDispose()
      const dh_Z = BigInts.tryExport(Z).throw(t).copyAndDispose()

      return new Ok({ dh_Yc, dh_Z })
    })
  }

  async #computeEllipticCurveDiffieHellman(state: ServerKeyExchangeState & { server_ecdh_params: ServerECDHParams }) {
    if (state.server_ecdh_params.curve_params.named_curve.value === NamedCurve.types.secp256r1)
      return new Secp256r1().diffie_hellman(state.server_ecdh_params)

    throw new Panic(`Invalid curve type`)
  }

  async #tryComputeSecrets(state: ServerKeyExchangeState, premaster_secret: Uint8Array): Promise<Result<Secrets, Error>> {
    return await Result.unthrow(async t => {
      const { cipher, client_random, server_random } = state
      const { prf_md } = state.cipher.hash

      // Console.debug("premaster_secret", premaster_secret.length, Bytes.toHex(premaster_secret))

      const master_secret_seed = Bytes.concat([client_random, server_random])
      const master_secret = await prfOrThrow(prf_md, premaster_secret, "master secret", master_secret_seed, 48)
      // Console.debug("master_secret", master_secret.length, Bytes.toHex(master_secret))

      const key_block_length = 0
        + (2 * cipher.hash.mac_key_length)
        + (2 * cipher.encryption.enc_key_length)
        + (2 * cipher.encryption.fixed_iv_length)

      const key_block_seed = Bytes.concat([server_random, client_random])
      const key_block = await prfOrThrow(prf_md, master_secret, "key expansion", key_block_seed, key_block_length)

      // Console.debug("key_block", key_block.length, Bytes.toHex(key_block))

      const key_block_cursor = new Cursor(key_block)

      const mac_key_length = state.cipher.encryption.cipher_type === "block"
        ? cipher.hash.mac.mac_key_length
        : 0

      const client_write_MAC_key = key_block_cursor.tryRead(mac_key_length).throw(t)
      const server_write_MAC_key = key_block_cursor.tryRead(mac_key_length).throw(t)

      // Console.debug("client_write_MAC_key", client_write_MAC_key.length, Bytes.toHex(client_write_MAC_key))
      // Console.debug("server_write_MAC_key", server_write_MAC_key.length, Bytes.toHex(server_write_MAC_key))

      const client_write_key = key_block_cursor.tryRead(cipher.encryption.enc_key_length).throw(t)
      const server_write_key = key_block_cursor.tryRead(cipher.encryption.enc_key_length).throw(t)

      // Console.debug("client_write_key", client_write_key.length, Bytes.toHex(client_write_key))
      // Console.debug("server_write_key", server_write_key.length, Bytes.toHex(server_write_key))

      const client_write_IV = key_block_cursor.tryRead(cipher.encryption.fixed_iv_length).throw(t)
      const server_write_IV = key_block_cursor.tryRead(cipher.encryption.fixed_iv_length).throw(t)

      // Console.debug("client_write_IV", client_write_IV.length, Bytes.toHex(client_write_IV))
      // Console.debug("server_write_IV", server_write_IV.length, Bytes.toHex(server_write_IV))

      return new Ok({
        master_secret,
        client_write_MAC_key,
        server_write_MAC_key,
        client_write_key,
        server_write_key,
        client_write_IV,
        server_write_IV
      })
    })
  }

  async #onServerHelloDone(handshake: Handshake<Opaque>, state: HandshakeState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.step !== "server_hello")
        return new Err(new InvalidTlsStateError())

      const server_hello_done = handshake.fragment.tryReadInto(ServerHelloDone2).throw(t)

      Console.debug(server_hello_done)

      if ("certificate_request" in state) {
        const certificate_list = Vector(Number24).from(List.from<Vector<Number24, Opaque>>([]))

        const certificate = new Certificate2(certificate_list)
        const handshake_certificate = Handshake.from(certificate)
        const record_certificate = PlaintextRecord.from(handshake_certificate, state.version)

        state.messages.push(Writable.tryWriteToBytes(handshake_certificate).throw(t))
        this.#output.enqueue(record_certificate)
      }

      let secrets: Secrets

      if ("server_dh_params" in state) {
        const { dh_Yc, dh_Z } = this.#tryComputeDiffieHellman(state).throw(t)

        const handshake_client_key_exchange = Handshake.from(ClientKeyExchange2DH.from(dh_Yc))
        const record_client_key_exchange = PlaintextRecord.from(handshake_client_key_exchange, state.version)

        state.messages.push(Writable.tryWriteToBytes(handshake_client_key_exchange).throw(t))
        this.#output.enqueue(record_client_key_exchange)

        secrets = await this.#tryComputeSecrets(state, dh_Z).then(r => r.throw(t))
      }

      else if ("server_ecdh_params" in state) {
        const { ecdh_Yc, ecdh_Z } = await this.#computeEllipticCurveDiffieHellman(state).then(r => r.throw(t))

        const handshake_client_key_exchange = Handshake.from(ClientKeyExchange2ECDH.from(ecdh_Yc))
        const record_client_key_exchange = PlaintextRecord.from(handshake_client_key_exchange, state.version)

        state.messages.push(Writable.tryWriteToBytes(handshake_client_key_exchange).throw(t))
        this.#output.enqueue(record_client_key_exchange)

        secrets = await this.#tryComputeSecrets(state, ecdh_Z).then(r => r.throw(t))
      }

      else return new Err(new InvalidTlsStateError())

      const encrypter = await state.cipher.tryInit(secrets).then(r => r.throw(t))

      const change_cipher_spec = new ChangeCipherSpec()
      const record_change_cipher_spec = PlaintextRecord.from(change_cipher_spec, state.version)

      const state2: ClientChangeCipherSpecState = { ...state, step: "client_change_cipher_spec", encrypter, client_encrypted: true, client_sequence: BigInt(0) }

      this.#state = state2

      this.#output.enqueue(record_change_cipher_spec)

      const { handshake_md, prf_md } = state2.cipher.hash

      const handshake_messages = Bytes.concat(state2.messages)
      const handshake_messages_hash = new Uint8Array(await crypto.subtle.digest(handshake_md, handshake_messages))

      const verify_data = await prfOrThrow(prf_md, secrets.master_secret, "client finished", handshake_messages_hash, 12)
      const finished = PlaintextRecord.from(Handshake.from(new Finished2(verify_data)), state.version)
      const cfinished = await finished.tryEncrypt(state2.encrypter, state2.client_sequence++)

      this.#output.enqueue(cfinished.throw(t))

      this.#state = { ...state2, step: "client_finished" }

      return Ok.void()
    })
  }

  async #onFinished(handshake: Handshake<Opaque>, state: HandshakeState): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      if (state.step !== "server_change_cipher_spec")
        return new Err(new InvalidTlsStateError())

      const finished = handshake.fragment.tryReadInto(Finished2).throw(t)

      Console.debug(finished)

      this.#state = { ...state, type: "handshaked" }

      await this.events.input.emit("handshaked", [])

      return Ok.void()
    })
  }

}