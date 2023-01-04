export interface Secrets {
  master_secret: Buffer,
  client_write_MAC_key: Buffer,
  server_write_MAC_key: Buffer,
  client_write_key: Buffer,
  server_write_key: Buffer,
  client_write_IV: Buffer,
  server_write_IV: Buffer
}