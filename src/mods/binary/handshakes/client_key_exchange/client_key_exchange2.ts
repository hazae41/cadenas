import { CipherSuite } from "mods/ciphers/cipher.js";

export function getClientKeyExchange2(cipher: CipherSuite) {
  if (cipher.key_exchange === "rsa")
    return ClientKeyExchange2RSA
  return ClientKeyExchange2DH
}

export class ClientKeyExchange2RSA {

}

export class ClientKeyExchange2DH {

}