export interface Encryption {
  readonly name: string

  readonly enc_key_length: number
  readonly fixed_iv_length: number
}