// @flow
import electronStore from '../config/electron-store';
import { MAINNET, TESTNET } from '../app/constants/anon-network';
import { isTestnet } from '../config/is-testnet';
import eres from 'eres';
import rpc from '../services/api';

const getStoreKey = () => `SHIELDED_TRANSACTIONS_${isTestnet() ? TESTNET : MAINNET}`;
const STORE_KEY = getStoreKey();

type ShieldedTransaction = {|
  txid: string,
  category: 'send' | 'receive',
  time: number,
  address: string,
  amount: number,
  memo: ?string,
|};

type ShieldedAddressLabel = {|
  label: string,
  address: string,
|};

let txNoteMerge = [];
let zReceivedByTransactions = [];

const zListReceivedByAddressAll = (async () => {
  const [zAddressesErr, zAddresses = []] = await eres(rpc.z_listaddresses());

  if (zAddressesErr) {
    return dispatch(
      loadWalletSummaryError({
        error: 'Something went wrong!',
      }),
    );
  }

  for (let zAddr of zAddresses) {
    let txZAddr;
    let zSendAddr;
    const [receivedErr, zListReceivedByAddress] = await eres(rpc.z_listreceivedbyaddress(zAddr))

    if (receivedErr) {
      return dispatch(
        loadWalletSummaryError({
          error: 'Something went wrong!',
        }),
      );
    }

    for (txZAddr of zListReceivedByAddress) {
      const [txErr, txTime] = await eres(rpc.gettransaction(txZAddr.txid))

      if (txErr) {
        return dispatch(
          loadWalletSummaryError({
            error: 'Something went wrong!',
          }),
        );
      }

      const zSendTransactions = (electronStore.has(STORE_KEY) ? electronStore.get(STORE_KEY) : []).filter(t => t.category === 'send');
      zSendAddr = zSendTransactions.find(z => z.txid === txZAddr.txid) || ''

      //basic filter to add only non-change addresses to list
      if (!zSendTransactions.some(z => (z.fromaddress === zAddr && z.txid === txZAddr.txid && z.amount !== txZAddr.amount)))
      {
        zReceivedByTransactions.push({
          confirmations: txTime.confirmations,
          txid: txZAddr.txid,
          category: "receive",
          time: txTime.time,
          fromaddress: zSendAddr.fromaddress || '(Shielded)',
          toaddress: zAddr,
          amount: txZAddr.amount,
          memo: txZAddr.memo,
        })
      }
    }
  }
  //group notes to give single total for address
  txNoteMerge = await Object.values([...zReceivedByTransactions]
    .reduce((tx, { confirmations, txid, category, time, toaddress, fromaddress, memo, amount }) => {
    tx[txid] = { confirmations, txid, category, time, toaddress, fromaddress, memo, amount : (tx[txid] ? tx[txid].amount : 0) + amount  };
    return tx;
  }, {}));
})

export const zGetZTxsFromStore = () => {
  return electronStore.has(STORE_KEY) ? electronStore.get(STORE_KEY) : []
}

// eslint-disable-next-line
export const listShieldedTransactions = async (
  pagination: ?{
    offset: number,
    count: number,
  },
): Array<ShieldedTransaction> => {

  let trans = []
  txNoteMerge = []
  zReceivedByTransactions=[]

  const transSend = (electronStore.has(STORE_KEY) ? electronStore.get(STORE_KEY) : []).filter(t => t.category === 'send')
  const transRcv = (electronStore.has(STORE_KEY) ? electronStore.get(STORE_KEY) : []).filter(t => t.category === 'receive')
  await zListReceivedByAddressAll();

//this merges to include the isRead prop and is used for display
const txReceivedByMerge = txNoteMerge.map((receivedBy)=>
    Object.assign({}, receivedBy, transRcv.find((txRcvStore)=>
      txRcvStore.txid===receivedBy.txid && 
      txRcvStore.amount===receivedBy.amount &&
      txRcvStore.category===receivedBy.category)||{}))

//confirmations are excluded from store
const forStore = txReceivedByMerge.map(t=>({
  amount: t.amount,
  category: t.category,
  fromaddress: t.fromaddress,
  isRead: t.isRead,
  memo: t.memo,
  time: t.time,
  toaddress: t.toaddress,
  txid: t.txid
}))

  trans = [...transSend, ...txReceivedByMerge].sort((a, b) => (a.time > b.time) ? 1 : -1)

  //update electron store
  electronStore.set(STORE_KEY, [...transSend, ...forStore])

  if (!pagination) return trans;

  const { offset = 0, count = 10 } = pagination;

  return trans.slice(offset - 1, offset + count);
};

export const saveShieldedTransaction = async ({ txid, category, time, toaddress, fromaddress, amount, memo }: ShieldedTransaction): void => 
  {
    electronStore.set
    (
      getStoreKey(),
      (await listShieldedTransactions()).concat(
      {
        txid,
        category,
        time,
        toaddress,
        fromaddress,
        amount,
        memo,
      }),
    );
  };
