import { Uint8Array } from "@hazae41/bytes"
import { Certificate } from "@hazae41/x509"
import { CertificateRequest2 } from "./binary/records/handshakes/certificate_request/certificate_request2.js"
import { ServerDHParams } from "./binary/records/handshakes/server_key_exchange/server_dh_params.js"
import { ServerECDHParams } from "./binary/records/handshakes/server_key_exchange/server_ecdh_params.js"
import { Cipher } from "./ciphers/cipher.js"
import { Encrypter } from "./ciphers/encryptions/encryption.js"
import { Extensions } from "./extensions.js"

export type TlsClientDuplexState =
  | NoneState
  | HandshakeState
  | HandshakedState

export type NoneState = {
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
  client_random: Uint8Array<32>
  client_extensions: Extensions
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
  server_random: Uint8Array<32>
  server_extensions: Extensions
}

export type ServerHelloState = ServerHelloData & {
  type: "handshake"
  step: "server_hello"
  action: "server_hello"
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