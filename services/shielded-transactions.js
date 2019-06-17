// @flow
import electronStore from '../config/electron-store';
import { MAINNET, TESTNET } from '../app/constants/anon-network';
import { isTestnet } from '../config/is-testnet';
import eres from 'eres';
import rpc from '../services/api';

const getStoreKey = () => `SHIELDED_TRANSACTIONS_${isTestnet() ? TESTNET : MAINNET}`;

type ShieldedTransaction = {|
  txid: string,
  category: 'send' | 'receive',
  time: number,
  address: string,
  amount: number,
  memo: ?string,
|};

// eslint-disable-next-line
export const listShieldedTransactions = async (
  pagination: ?{
    offset: number,
    count: number,
  },
): Array<ShieldedTransaction> => {
  const STORE_KEY = getStoreKey();

  const transactions = electronStore.has(STORE_KEY) ? electronStore.get(STORE_KEY) : [];
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
        zReceivedByTransactions.push({
          txid: txZAddr.txid,
          category: "receive",
          time: txTime.time,
          address: "(Shielded)",
          amount: txZAddr.amount,
          memo: txZAddr.memo,
        })
      }
    }
  })

  await zListReceivedByAddressAll();

  return transactions.concat(zReceivedByTransactions).sort((a, b) => (a.time > b.time) ? 1 : -1)

  if (!pagination) return transactions;

  const { offset = 0, count = 10 } = pagination;

  return transactions.slice(offset - 1, offset + count);
};

export const saveShieldedTransaction = ({
  txid,
  category,
  time,
  address,
  amount,
  memo,
}: ShieldedTransaction): void => {
  electronStore.set(
    getStoreKey(),
    listShieldedTransactions().concat({
      txid,
      category,
      time,
      address,
      amount,
      memo: memo || '',
    }),
  );
};
