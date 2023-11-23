import "@hazae41/symbol-dispose-polyfill"

import { IA5String } from "@hazae41/asn1"
import { Base16 } from "@hazae41/base16"
import { Opaque, Readable, Writable } from "@hazae41/binary"
import { Bytes, Uint8Array } from "@hazae41/bytes"
import { SuperTransformStream } from "@hazae41/cascade"
import { Cursor } from "@hazae41/cursor"
import { Future } from "@hazae41/future"
import { None } from "@hazae41/option"
import { CloseEvents, ErrorEvents, Plume, SuperEventTarget } from "@hazae41/plume"
import { Panic } from "@hazae41/result"
import { OIDs, OtherName, SubjectAltName, X509 } from "@hazae41/x509"
import { BigBytes } from "libs/bigint/bigint.js"
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
import { FatalAlertError, InvalidTlsStateError, UnsupportedCipherError, UnsupportedVersionError, WarningAlertError } from "./errors.js"
import { Extensions } from "./extensions.js"
import { ClientChangeCipherSpecState, HandshakeState, ServerKeyExchangeState, TlsClientDuplexState } from "./state.js"


export interface TlsClientDuplexParams {
  /**
   * Supported ciphers
   */
  readonly ciphers: Cipher[]

  /**
   * Used for SNI and certificates verification, leave null to disable
   */
  readonly host_name?: string

  /**
   * Do not verify certificates against root certificate authorities
   */
  readonly authorized?: boolean
}

export type TlsClientDuplexReadEvents = CloseEvents & ErrorEvents & {
  certificates: (certificates: X509.Certificate[]) => void
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
    const postOutputer = this.#output.start()

    const postInputer = new TransformStream<Opaque, Opaque>({})
    const preOutputer = new TransformStream<Writable, Writable>({})

    /**
     * Inner protocol (TCP?)
     */
    this.inner = {
      readable: postOutputer.readable,
      writable: preInputer.writable
    } as const

    /**
     * Outer protocol (HTTP?)
     */
    this.outer = {
      readable: postInputer.readable,
      writable: preOutputer.writable
    } as const

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

  async #onInputClose() {
    Console.debug(`${this.#class.name}.onReadClose`)

    this.#input.closed = {}

    await this.events.input.emit("close", [undefined])
  }

  async #onOutputClose() {
    Console.debug(`${this.#class.name}.onWriteClose`)

    this.#output.closed = {}

    await this.events.output.emit("close", [undefined])
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

  async #onOutputStart() {
    if (this.#state.type !== "none")
      throw new InvalidTlsStateError()

    const client_hello = ClientHello2.default(this.params.ciphers, this.params.host_name)

    const client_random = Writable.writeToBytesOrThrow(client_hello.random) as Uint8Array<32>
    const client_extensions = Extensions.getClientExtensions(client_hello)

    const client_hello_handshake = Handshake.from(client_hello)
    const messages = [Writable.writeToBytesOrThrow(client_hello_handshake)]

    this.#state = { ...this.#state, type: "handshake", messages, step: "client_hello", client_random, client_extensions }

    const client_hello_handshake_record = PlaintextRecord.from(client_hello_handshake, 0x0301)
    this.#output.enqueue(client_hello_handshake_record)

    await Plume.waitOrCloseOrError(this.events.input, "handshaked", (future: Future<void>) => {
      future.resolve()
      return new None()
    })
  }

  async #onInputTransform(chunk: Opaque) {
    // Console.debug(this.#class.name, "<-", chunk)

    if (this.#buffer.offset)
      await this.#onReadBuffered(chunk.bytes)
    else
      await this.#onReadDirect(chunk.bytes)
  }

  /**
   * Read from buffer
   * @param chunk 
   * @returns 
   */
  async #onReadBuffered(chunk: Uint8Array) {
    this.#buffer.writeOrThrow(chunk)
    const full = new Uint8Array(this.#buffer.before)

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
      let record: PlaintextRecord<Opaque>

      try {
        record = Readable.readOrRollbackAndThrow(PlaintextRecord, cursor)
      } catch (e) {
        this.#buffer.writeOrThrow(cursor.after)
        break
      }

      await this.#onRecord(record, this.#state)
    }
  }

  async #onOutputTransform(chunk: Writable) {
    if (this.#state.type !== "handshaked")
      throw new InvalidTlsStateError()

    const state = this.#state

    const { version, encrypter } = state
    const type = Record.types.application_data

    const plaintext = new PlaintextRecord(type, version, chunk)
    const ciphertext = await plaintext.encryptOrThrow(encrypter, state.client_sequence++)

    this.#output.enqueue(ciphertext)
  }

  async #onRecord(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState) {
    if (state.server_encrypted)
      await this.#onCiphertextRecord(record, state)
    else
      await this.#onPlaintextRecord(record, state)
  }

  async #onCiphertextRecord(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState & { server_encrypted: true }) {
    if (state.encrypter.cipher_type === "block") {
      const cipher = BlockCiphertextRecord.fromOrThrow(record)
      const plain = await cipher.decryptOrThrow(state.encrypter, state.server_sequence++)
      return await this.#onPlaintextRecord(plain, state)
    }

    if (state.encrypter.cipher_type === "aead") {
      const cipher = AEADCiphertextRecord.fromOrThrow(record)
      const plain = await cipher.decryptOrThrow(state.encrypter, state.server_sequence++)
      return await this.#onPlaintextRecord(plain, state)
    }

    throw new Panic(`Invalid cipher type`)
  }

  async #onPlaintextRecord(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState) {
    if (record.type === Alert.record_type)
      return await this.#onAlert(record, state)
    if (record.type === Handshake.record_type)
      return await this.#onHandshake(record, state)
    if (record.type === ChangeCipherSpec.record_type)
      return await this.#onChangeCipherSpec(record, state)
    if (record.type === Record.types.application_data)
      return await this.#onApplicationData(record, state)

    console.warn(record)
  }

  async #onAlert(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState) {
    const alert = record.fragment.readIntoOrThrow(Alert)

    Console.debug(alert)

    if (alert.level === Alert.levels.fatal)
      throw new FatalAlertError(alert)

    if (alert.description === Alert.descriptions.close_notify)
      return this.#input.terminate()

    if (alert.level === Alert.levels.warning)
      return console.warn(new WarningAlertError(alert))

    console.warn(`Unknown alert level ${alert.level}`)
  }

  async #onChangeCipherSpec(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState) {
    if (state.type !== "handshake")
      throw new InvalidTlsStateError()
    if (state.step !== "client_finished")
      throw new InvalidTlsStateError()

    const change_cipher_spec = record.fragment.readIntoOrThrow(ChangeCipherSpec)

    Console.debug(change_cipher_spec)

    this.#state = { ...state, step: "server_change_cipher_spec", server_encrypted: true, server_sequence: BigInt(0) }
  }

  async #onApplicationData(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState) {
    if (state.type !== "handshaked")
      throw new InvalidTlsStateError()

    this.#input.enqueue(record.fragment)
  }

  async #onHandshake(record: PlaintextRecord<Opaque>, state: TlsClientDuplexState) {
    if (state.type !== "handshake")
      throw new InvalidTlsStateError()

    const handshake = record.fragment.readIntoOrThrow(Handshake)

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
  }

  async #onServerHello(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "client_hello")
      throw new InvalidTlsStateError()

    const server_hello = handshake.fragment.readIntoOrThrow(ServerHello2)

    Console.debug(server_hello)

    const version = server_hello.server_version

    if (version !== 0x0303)
      throw new UnsupportedVersionError(version)

    const cipher = this.params.ciphers.find(it => it.id === server_hello.cipher_suite)

    if (cipher === undefined)
      throw new UnsupportedCipherError(server_hello.cipher_suite)

    const server_random = Writable.writeToBytesOrThrow(server_hello.random) as Uint8Array<32>
    const server_extensions = Extensions.getServerExtensions(server_hello, state.client_extensions)

    Console.debug(server_extensions)

    this.#state = { ...state, step: "server_hello", action: "server_hello", version, cipher, server_random, server_extensions }
  }

  #verifyHostNameOrThrow(certificate: X509.Certificate) {
    const { host_name } = this.params

    /**
     * Do not check if no host name is provided
     */
    if (host_name == null)
      return true

    if (certificate.tbsCertificate.extensions == null)
      throw new Error("Could not verify domain name")

    for (const extension of certificate.tbsCertificate.extensions?.extensions) {
      if (extension.extnID.value.inner === OIDs.keys.subjectAltName) {
        const subjectAltName = extension.extnValue as SubjectAltName

        for (const name of subjectAltName.inner.names) {
          if (name instanceof OtherName)
            continue
          if (name instanceof IA5String) {
            /**
             * Verify exact match
             */
            if (name.value === host_name)
              return true

            /**
             * Verify with wildcards
             */

            const self: string[] = host_name.split(".")
            const other: string[] = name.value.split(".")

            if (self.length !== other.length)
              continue

            const unstarred = other.map((x, i) => {
              if (x === "*")
                return self[i]
              return x
            }).join(".")

            if (unstarred === host_name)
              return true
            continue
          }
        }
      }
    }

    throw new Error("Could not verify domain name")
  }

  async #onCertificate(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new InvalidTlsStateError()

    const certificate = handshake.fragment.readIntoOrThrow(Certificate2)

    Console.debug(certificate)

    const server_certificates = certificate.certificate_list.value.array.map(it => X509.readAndResolveFromBytesOrThrow(X509.Certificate, it.value.bytes))

    const now = new Date()

    if (server_certificates.length === 0)
      throw new Error(`Empty certificates`)

    /**
     * Verify host name
     */
    if (this.#verifyHostNameOrThrow(server_certificates[0]) !== true)
      throw new Error("Could not verify domain name")

    /**
     * Verify against root certificate authorities
     */
    if (!this.params.authorized) {
      const last = server_certificates[server_certificates.length - 1]

      const issuer = last.tbsCertificate.issuer.toX501OrThrow()
      const trusted = CCADB.trusteds[issuer]

      if (trusted == null)
        throw new Error(`No matching root certificate authority`)

      const { notAfter, certHex } = trusted

      if (notAfter != null && now > new Date(notAfter))
        throw new Error(`Root certificate is distrusted`)

      using certSlice = Base16.get().padStartAndDecodeOrThrow(certHex)
      const certX509 = X509.readAndResolveFromBytesOrThrow(X509.Certificate, certSlice.bytes)

      server_certificates.push(certX509)
    }

    /**
     * Verify certificate chain (including root certificate authority)
     */
    for (let i = 0; i < server_certificates.length; i++) {
      const current = server_certificates[i]
      const next = server_certificates.at(i + 1)

      if (now > current.tbsCertificate.validity.notAfter.value)
        throw new Error(`Certificate is expired`)
      if (now < current.tbsCertificate.validity.notBefore.value)
        throw new Error(`Certificate is not yet valid`)

      if (next == null)
        break

      if (current.algorithmIdentifier.algorithm.value.inner !== OIDs.keys.sha256WithRSAEncryption)
        throw new Error(`Unsupported signature algorithm ${current.algorithmIdentifier.algorithm.value.inner}`)

      const signed = X509.writeToBytesOrThrow(current.tbsCertificate)
      const publicKey = X509.writeToBytesOrThrow(next.tbsCertificate.subjectPublicKeyInfo)

      const signatureAlgorithm = { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } }
      const signature = current.signatureValue.bytes

      const key = await crypto.subtle.importKey("spki", publicKey, signatureAlgorithm, true, ["verify"])
      const verified = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, signed)

      if (!verified)
        throw new Error(`Invalid signature`)

      continue
    }

    await this.events.input.emit("certificates", [server_certificates])

    this.#state = { ...state, action: "server_certificate", server_certificates }
  }

  async #onServerKeyExchange(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new InvalidTlsStateError()

    const clazz = ReadableServerKeyExchange2.getOrThrow(state.cipher)

    const server_key_exchange = handshake.fragment.readIntoOrThrow(clazz)

    if (server_key_exchange instanceof ServerKeyExchange2DHSigned) {
      Console.debug(server_key_exchange)

      const { params } = server_key_exchange

      console.warn("Could not verify key exchange")

      this.#state = { ...state, action: "server_key_exchange", server_dh_params: params }

      return
    }

    if (server_key_exchange instanceof ServerKeyExchange2ECDHSigned) {
      Console.debug(server_key_exchange)

      if (state.action !== "server_certificate")
        throw new InvalidTlsStateError()

      const { params, signed_params } = server_key_exchange

      if (signed_params.algorithm.hash.type !== HashAlgorithm.types.sha256)
        throw new Error(`Unsupported hash algorithm ${signed_params.algorithm.hash.type}`)

      if (signed_params.algorithm.signature.type !== SignatureAlgorithm.types.rsa)
        throw new Error(`Unsupported signature algorithm${signed_params.algorithm.signature.type}`)

      const publicKey = X509.writeToBytesOrThrow(state.server_certificates[0].tbsCertificate.subjectPublicKeyInfo)

      const presigned = new ServerKeyExchange2ECDHPreSigned(state.client_random, state.server_random, params)
      const bytes = Writable.writeToBytesOrThrow(presigned)

      const signatureAlgorithm = { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } }
      const signature = signed_params.signature.value.bytes

      const key = await crypto.subtle.importKey("spki", publicKey, signatureAlgorithm, true, ["verify"])
      const verified = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, bytes)

      if (!verified)
        throw new Error(`Invalid signature`)

      this.#state = { ...state, action: "server_key_exchange", server_ecdh_params: params }

      return
    }

    console.warn(server_key_exchange)
  }

  async #onCertificateRequest(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new InvalidTlsStateError()

    const certificate_request = handshake.fragment.readIntoOrThrow(CertificateRequest2)

    Console.debug(certificate_request)

    this.#state = { ...state, action: "server_certificate_request", certificate_request }
  }

  #computeDhOrThrow(state: ServerKeyExchangeState & { server_dh_params: ServerDHParams }): { dh_Yc: Uint8Array, dh_Z: Uint8Array } {
    const { dh_g, dh_p, dh_Ys } = state.server_dh_params

    const g = BigBytes.importOrThrow(dh_g.value.bytes)
    const p = BigBytes.importOrThrow(dh_p.value.bytes)
    const Ys = BigBytes.importOrThrow(dh_Ys.value.bytes)

    const dh_yc = Bytes.random(dh_p.value.bytes.length)

    const yc = BigBytes.importOrThrow(dh_yc)

    const Yc = BigMath.umodpow(g, yc, p)
    const Z = BigMath.umodpow(Ys, yc, p)

    const dh_Yc = BigBytes.exportOrThrow(Yc)
    const dh_Z = BigBytes.exportOrThrow(Z)

    return { dh_Yc, dh_Z }
  }

  async #computeEcDhOrThrow(state: ServerKeyExchangeState & { server_ecdh_params: ServerECDHParams }) {
    if (state.server_ecdh_params.curve_params.named_curve.value === NamedCurve.types.secp256r1)
      return new Secp256r1().computeOrThrow(state.server_ecdh_params)

    throw new Panic(`Invalid curve type`)
  }

  async #computeSecretsOrThrow(state: ServerKeyExchangeState, premaster_secret: Uint8Array): Promise<Secrets> {
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

    const client_write_MAC_key = key_block_cursor.readAndCopyOrThrow(mac_key_length)
    const server_write_MAC_key = key_block_cursor.readAndCopyOrThrow(mac_key_length)

    // Console.debug("client_write_MAC_key", client_write_MAC_key.length, Bytes.toHex(client_write_MAC_key))
    // Console.debug("server_write_MAC_key", server_write_MAC_key.length, Bytes.toHex(server_write_MAC_key))

    const client_write_key = key_block_cursor.readAndCopyOrThrow(cipher.encryption.enc_key_length)
    const server_write_key = key_block_cursor.readAndCopyOrThrow(cipher.encryption.enc_key_length)

    // Console.debug("client_write_key", client_write_key.length, Bytes.toHex(client_write_key))
    // Console.debug("server_write_key", server_write_key.length, Bytes.toHex(server_write_key))

    const client_write_IV = key_block_cursor.readAndCopyOrThrow(cipher.encryption.fixed_iv_length)
    const server_write_IV = key_block_cursor.readAndCopyOrThrow(cipher.encryption.fixed_iv_length)

    // Console.debug("client_write_IV", client_write_IV.length, Bytes.toHex(client_write_IV))
    // Console.debug("server_write_IV", server_write_IV.length, Bytes.toHex(server_write_IV))

    return {
      master_secret,
      client_write_MAC_key,
      server_write_MAC_key,
      client_write_key,
      server_write_key,
      client_write_IV,
      server_write_IV
    }
  }

  async #onServerHelloDone(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_hello")
      throw new InvalidTlsStateError()

    const server_hello_done = handshake.fragment.readIntoOrThrow(ServerHelloDone2)

    Console.debug(server_hello_done)

    if ("certificate_request" in state) {
      const certificate_list = Vector(Number24).from(List.from<Vector<Number24, Opaque>>([]))

      const certificate = new Certificate2(certificate_list)
      const handshake_certificate = Handshake.from(certificate)
      const record_certificate = PlaintextRecord.from(handshake_certificate, state.version)

      state.messages.push(Writable.writeToBytesOrThrow(handshake_certificate))
      this.#output.enqueue(record_certificate)
    }

    let secrets: Secrets

    if ("server_dh_params" in state) {
      const { dh_Yc, dh_Z } = this.#computeDhOrThrow(state)

      const handshake_client_key_exchange = Handshake.from(ClientKeyExchange2DH.from(dh_Yc))
      const record_client_key_exchange = PlaintextRecord.from(handshake_client_key_exchange, state.version)

      state.messages.push(Writable.writeToBytesOrThrow(handshake_client_key_exchange))
      this.#output.enqueue(record_client_key_exchange)

      secrets = await this.#computeSecretsOrThrow(state, dh_Z)
    }

    else if ("server_ecdh_params" in state) {
      const { ecdh_Yc, ecdh_Z } = await this.#computeEcDhOrThrow(state)

      const handshake_client_key_exchange = Handshake.from(ClientKeyExchange2ECDH.from(ecdh_Yc))
      const record_client_key_exchange = PlaintextRecord.from(handshake_client_key_exchange, state.version)

      state.messages.push(Writable.writeToBytesOrThrow(handshake_client_key_exchange))
      this.#output.enqueue(record_client_key_exchange)

      secrets = await this.#computeSecretsOrThrow(state, ecdh_Z)
    }

    else throw new InvalidTlsStateError()

    const encrypter = await state.cipher.initOrThrow(secrets)

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
    const cfinished = await finished.encryptOrThrow(state2.encrypter, state2.client_sequence++)

    this.#output.enqueue(cfinished)

    this.#state = { ...state2, step: "client_finished" }
  }

  async #onFinished(handshake: Handshake<Opaque>, state: HandshakeState) {
    if (state.step !== "server_change_cipher_spec")
      throw new InvalidTlsStateError()

    const finished = handshake.fragment.readIntoOrThrow(Finished2)

    Console.debug(finished)

    this.#state = { ...state, type: "handshaked" }

    await this.events.input.emit("handshaked", [])
  }

}