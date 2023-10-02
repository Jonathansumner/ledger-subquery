import {Message, Event, TxStatus, Block, Transaction, Transfer} from "../types";
import {
  CosmosEvent,
  CosmosBlock,
  CosmosMessage,
  CosmosTransaction,
} from "@subql/types-cosmos";
import {createHash} from "crypto";
import {toBech32} from "@cosmjs/encoding";

export function messageId(msg: CosmosMessage | CosmosEvent): string {
  return `${msg?.tx?.hash}-${msg?.idx}`;
}

export function getTimeline(entity: CosmosMessage|CosmosEvent): bigint {
  const K2 = 100, K1 = K2 * 1000;
  const txIndex = entity.tx.idx;
  const blockHeight = entity.block.block.header.height;
  // check if entity is Event or Message, and set msgIndex appropriately
  const msgIndex = (<CosmosEvent>entity).msg?.idx === undefined ?
      (<CosmosMessage>entity).idx : (<CosmosEvent>entity).msg.idx;
  const timeline = (K1 * blockHeight) + (K2 * txIndex) + msgIndex;
  return BigInt(timeline);
}

export async function handleBlock(block: CosmosBlock): Promise<void> {
  const {id, header: {chainId, height, time}} = block.block;
  const timestamp = time
  const blockEntity = Block.create({
    id,
    chainId,
    height: BigInt(height),
    timestamp
  });

  await blockEntity.save();
}

export async function handleTransaction(tx: CosmosTransaction): Promise<void> {
  let status = TxStatus.Error;
  if (tx?.tx?.log) {
    try {
      JSON.parse(tx?.tx?.log);
      status = TxStatus.Success;
    } catch {
      // NB: assume tx failed
    }
  }
  const timeline = BigInt((tx?.block?.block?.header?.height * 100000) + tx?.idx);
  const pubKey: Uint8Array | undefined = tx?.decodedTx?.authInfo?.signerInfos[0]?.publicKey?.value;
  let signerAddress;
  if (typeof (pubKey) !== "undefined") {
    // TODO: check key type and handle respectively
    // NB: ripemd160(sha256(pubKey)) only works for secp256k1 keys
    const ripemd160 = createHash("ripemd160");
    const sha256 = createHash("sha256");
    // TODO: understand why!!!
    // NB: pubKey has 2 "extra" bytes at the beginning as compared to the
    // base64-decoded representation/ of the same key when imported to
    // fetchd (`fetchd keys add --recover`) and shown (`fetchd keys show`).
    sha256.update(pubKey.slice(2));
    ripemd160.update(sha256.digest());
    // TODO: move prefix to config value or constant
    signerAddress = toBech32("fetch", ripemd160.digest());
  }

  const txEntity = Transaction.create({
    id: tx?.hash,
    timeline,
    blockId: tx?.block?.block?.id,
    gasUsed: BigInt(Math.trunc(tx.tx.gasUsed)),
    gasWanted: BigInt(Math.trunc(tx.tx.gasWanted)),
    memo: tx?.decodedTx?.body?.memo,
    timeoutHeight: BigInt(tx?.decodedTx?.body?.timeoutHeight?.toString()),
    log: tx?.tx?.log,
    status,
    signerAddress,
  });

  await txEntity.save();
}

export async function handleMessage(msg: CosmosMessage): Promise<void> {
  const timeline = getTimeline(msg);

  delete msg?.msg?.decodedMsg?.wasmByteCode;
  const json = JSON.stringify(msg?.msg?.decodedMsg);
  const msgEntity = Message.create({
    id: messageId(msg),
    typeUrl: msg?.msg?.typeUrl,
    json,
    timeline,
  });

  await msgEntity.save();
}

export async function handleEvent(event: CosmosEvent): Promise<void> {
  // NB: sanitize attribute values (may contain non-text characters)
  const sanitize = (value: unknown) => {
    const json = JSON.stringify(value);
    return json.substring(1, json.length - 1);
  };
  const attributes = event?.event?.attributes?.map((attribute) => {
    const {key, value} = attribute;
    return {key, value: sanitize(value)};
  });

  const id = `${messageId(event)}-${event?.idx}`;
  const eventEntity = Event.create({
    id,
    type: event?.event?.type,
    log: event?.log?.log,
    attributes
  });
  await eventEntity.save();
}

export interface Coin {
  amount: string,
  denom: string,
}

export interface NativeTransferMsg {
  toAddress: string;
  fromAddress: string;
  amount: Coin[];
}

export async function handleTransfer(event: CosmosEvent): Promise<void> {
  const msg: CosmosMessage<NativeTransferMsg> = event.msg;
  const timeline = getTimeline(event);

  const fromAddress = msg.msg?.decodedMsg?.fromAddress;
  const toAddress = msg.msg?.decodedMsg?.toAddress;
  const amounts = msg.msg?.decodedMsg?.amount;

  // if (!fromAddress || !amounts || !toAddress) {
  //   logger.warn(`[handleNativeTransfer] (tx ${event.tx.hash}): cannot index event (event.event): ${JSON.stringify(event.event, null, 2)}`);
  //   return;
  // }

  // workaround: assuming one denomination per transfer message
  const denom = amounts[0].denom;
  const id = messageId(msg);
  const transferEntity = Transfer.create({
    id,
    toAddress,
    fromAddress,
    amounts,
    denom,
    timeline,
  });

  await transferEntity.save();
}
