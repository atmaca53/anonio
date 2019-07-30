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

  zReceivedByTransactions=[]
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
  return ( await Object.values([...zReceivedByTransactions]
    .reduce((tx, { confirmations, txid, category, time, toaddress, fromaddress, memo, amount }) => {
    tx[txid] = { confirmations, txid, category, time, toaddress, fromaddress, memo, amount : (tx[txid] ? tx[txid].amount : 0) + amount  };
    return tx;
  }, {})));
})

export const zGetZTxsFromStore = (count) => {
  return electronStore.has(STORE_KEY) ? electronStore.get(STORE_KEY).slice(0, count) : []
}

export const updateShieldedTransactions = async () => {

  const zTxs = electronStore.has(STORE_KEY) ? electronStore.get(STORE_KEY) : []

  const zTxSend = zTxs.filter(t => t.category === 'send')
  const txRcv = zTxs.filter(t => t.category === 'receive')

  // remove confirmations from stored values
  const zTxsRcvNoConf = txRcv.map(t=>({
    amount: t.amount,
    category: t.category,
    fromaddress: t.fromaddress,
    isRead: t.isRead,
    memo: t.memo,
    time: t.time,
    toaddress: t.toaddress,
    txid: t.txid
  }))

  // merge to include the isRead prop
  const txReceivedByMerge = await (await zListReceivedByAddressAll()).map((receivedBy)=>
      Object.assign({}, receivedBy, zTxsRcvNoConf.find((txRcvStore)=>
        txRcvStore.txid===receivedBy.txid && 
        txRcvStore.amount===receivedBy.amount &&
        txRcvStore.category===receivedBy.category)||{}))

  const trans = [...zTxSend, ...txReceivedByMerge].sort((a, b) => (a.time < b.time) ? 1 : -1)

  //update electron store
  electronStore.set(STORE_KEY, trans)
};

export const saveShieldedTransaction = async ({ txid, category, time, toaddress, fromaddress, amount, memo }: ShieldedTransaction): void => 
  {
    electronStore.set
    (
      getStoreKey(),
      (await zGetZTxsFromStore()).concat(
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
