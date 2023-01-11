export * from "./mods/index.test.js";

import { Binary } from "@hazae41/binary";
import { test } from "@hazae41/phobos";
import { Alert, ClientHello2, Handshake, HandshakeHeader } from "index.js";
import { Bytes } from "libs/bytes/bytes.js";
import { RecordHeader } from "mods/binary/record/record.js";
import { relative, resolve } from "path";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".cjs", ".ts")))

function read(hex: string) {
  const buffer = Bytes.fromHex(hex)
  const binary = new Binary(buffer)

  while (binary.remaining) {
    const record = RecordHeader.read(binary)

    if (!record) break

    onRecord(binary, record)
  }
}

function onRecord(binary: Binary, record: RecordHeader) {
  if (record.subtype === Alert.type)
    return onAlert(binary, record.length)
  if (record.subtype === Handshake.type)
    return onHandshake(binary, record.length)

  binary.offset += record.length

  console.warn(record)
}

function onAlert(binary: Binary, length: number) {
  const alert = Alert.read(binary, length)

  console.log(alert)
}

function onHandshake(binary: Binary, length: number) {
  const handshake = HandshakeHeader.read(binary, length)

  if (handshake.subtype === ClientHello2.type) {
    const hello = ClientHello2.read(binary, handshake.length)
    console.log(hello)
    return
  }

  binary.offset += handshake.length

  console.warn(handshake)
}

test("first", async ({ test, message }) => {
  console.log(message)
  read("16030100630100005f03014d88c72416ba3ed4bb8cb6301b2e67e171bf3b9be81690fe033a8a7139e0dc10000038c00ac01400390038c00fc0050035c007c009c00cc00e00330032c011c013c002c00400040005002fc008c01200160013c00dc003feff000a0100")
})

test("second", async ({ test, message }) => {
  console.log(message)
  read("160301002a02000026030125f7df7014518ba0785c0da71a6e7e82f77a579d4b099b46f28d09796c489e7c00003900160301024e0b00024a00024700024430820240308201a9a003020102020900d4dca459b7e70a8c300d06092a864886f70d01010b0500301b3119301706035504030c107777772e32366736663571712e636f6d301e170d3232313031353030303030305a170d3233303131373030303030305a30253123302106035504030c1a7777772e65763361766772667a7a6c7378716a6e6b6c2e6e657430820122300d06092a864886f70d01010105000382010f003082010a0282010100bf4ff3ef20d771849cf2236156d231c36933d95ef2b98f67a8a4dbcca97add1af292e689c189d4f00d812728e53d45bc876b0d4fff9973f6f5a47a662a4d7a172d29bf13d1bc50bf0c1a88aa9ac9cc3375e9d0c5ed9471d4c30e43d7685933d2854c81cefd2117f0d32834cd038237c7ead2e1f30348900c4c6f73070ee87727eaff4f44af903eb795c621a61ab082de3210a0715ffae7ad5b95f9afc6c52c44453cb14acdd43f1400f4308a18ccad88e2bee080b4b83402da40ff8ec2563db58fc4dd333f5802a696426ade0631b763949dc3fbd8c58af5917d992d0ab83af4342e06e7f572e3cd2c8b164946f291353066f5266ab30a1c194da9545c9416350203010001300d06092a864886f70d01010b0500038181007970b23760820bc28ec8c0bfebe20c32740cdc79e00439e582587076a12dc30b36d02600b76eb675d7450c85ef447a5fef86cd2dff836afd642f1fe3f34d9792712395ccafe972530a12382c2cd90348d60462ccf0cc46d1516d053fd43b4c7616781f0b06f9e318ecc23f1f70f53460dda8960e94f5e033e8f657a2ce8433ea160301020d0c0002090080d67de440cbbbdc1936d693d34afd0ad50c84d239a45f520bb88174cb98bce951849f912e639c72fb13b4b4d7177e16d55ac179ba420b2a29fe324a467a635e81ff5901377beddcfd33168a461aad3b72dae8860078045b07a7dbca7874087d1510ea9fcc9ddd330507dd62db88aeaa747de0f4d6e2bd68b0e7393e0f24218eb30001020080ca2cd97205b5de3b8637da571e35be2f4c5f1ea6b84204f57d2add46f99987f99b979fd275beb6e56fa1f42204388c05fd2b0829a8ed07701df373c9255703684e4141dbd87751cd085a923237ee94cb86cae1a138f96ad328fb121193c457b654ee0905cf8cb87712e5009f8ee709c9b9a6cae8b4d74774ffde03420de32dd501000302b84c3a09b91dda5008e3b20cbfd3af7ef971b8b6c3152cc2b4aac2f4ca0041a53d52f19354423f6364af7bfca4a9d0ab458fe82dd29dea51df15ee4a9f1616464db2f1671888af3376d59d9f13972ce66c68b2c1269c0a0ca80ada920ece764ebf615d1bcce9a8d0902f2c151adbe48cd865e379bb3966bd25bb84f8275f58c4b560b3dbb9bdbfdca49fffe36fbe1388aa793050d27c3f12b72f736d21e2e0f6c75a1dd2cf0fceed6024fbb63fe61393b0c9dfae10cc32ea2e1e5a222fd46737c457238985096a36c1cd705eff14c8322fedb4d6fec930ff655e9d0fa10af14f5825f056dd77bb3f8cc9bf76ce47b0a4e8e7dfd7545908a140c167e9499816030100040e000000")
})

test("third", async ({ test, message }) => {
  console.log(message)
  read("16030100861000008200806c2649897b4a950d0f37bb6af6530d893e65ca923d8900d797c9b6676dd5330060ccdcb2e89e1781892f2f88235ab8f7854bc27a26310aecbe60574f787bc4e5bc1859095cc4f8d66f1240aba3ee2dfebb9dfa8f589c09677f6214740fe0cca2b0d892c3dbd62c0874f53b143ced3698e4a6c5d65996fe0022c1c119d4313662140301000101160301003047dc444ffb59a5ea5d64e4e37e266bf307942e198dec131eb8f1910081469a2f41cb88c7934d5c669b29fc4f489fa2c7")
})