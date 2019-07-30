// @flow

import { connect } from 'react-redux';
import eres from 'eres';
import flow from 'lodash.flow';
import groupBy from 'lodash.groupby';
import dateFns from 'date-fns';
import { BigNumber } from 'bignumber.js';

import { DashboardView } from '../views/dashboard';

import rpc from '../../services/api';
import store from '../../config/electron-store';
import { SAPLING, MIN_CONFIRMATIONS_NUMBER } from '../constants/anon-network';
import { NODE_SYNC_TYPES } from '../constants/node-sync-types';
import { zGetZTxsFromStore, updateShieldedTransactions } from '../../services/shielded-transactions';
import { sortByDescend } from '../utils/sort-by-descend';

import {
  loadWalletSummary,
  loadWalletSummarySuccess,
  loadWalletSummaryError,
} from '../redux/modules/wallet';

import type { AppState } from '../types/app-state';
import type { Dispatch } from '../types/redux';

const mapStateToProps = ({ walletSummary, app }: AppState) => ({
  total: walletSummary.total,
  shielded: walletSummary.shielded,
  transparent: walletSummary.transparent,
  unconfirmed: walletSummary.unconfirmed,
  error: walletSummary.error,
  isLoading: walletSummary.isLoading,
  anonPrice: walletSummary.anonPrice,
  addresses: walletSummary.addresses,
  transactions: walletSummary.transactions,
  isDaemonReady: app.nodeSyncType === NODE_SYNC_TYPES.READY,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getSummary: async () => {
    dispatch(loadWalletSummary());

    const [walletErr, walletSummary] = await eres(rpc.z_gettotalbalance());
    const [zAddressesErr, zAddresses = []] = await eres(rpc.z_listaddresses());
    const [tAddressesErr, tAddresses = []] = await eres(rpc.getaddressesbyaccount(''));
    // needs to be greater than 10 to compensate for the cpu mined blocks on testnet
    // const [transactionsErr, transactions] = await eres(rpc.listtransactions('', 1000, 0));
    //this is the one to use when not cpu mining
    const [transactionsErr, transactions] = await eres(rpc.listtransactions(''));
    const [unconfirmedBalanceErr, unconfirmedBalance] = await eres(rpc.getunconfirmedbalance());

    if (walletErr || zAddressesErr || tAddressesErr || transactionsErr || unconfirmedBalanceErr) {
      return dispatch(
        loadWalletSummaryError({
          error: 'Something went wrong!',
        }),
      );
    }

    updateShieldedTransactions();

    const tTxs = transactions.filter(t => t.address && (t.category === 'receive' || t.category === 'send')).map(e => {return {
      confirmations: e.confirmations,
      txid: e.txid,
      category: e.category,
      time: e.time,
      toaddress: e.address,
      amount: e.amount,
    }})

    const zTx = await zGetZTxsFromStore()
    console.log('zTx')
    console.log(zTx)

    const formatMemo = (m) => {
      m = m.replace(/[0]+$/,'')
      if (m === "f6") return ''
      m = m.replace(/(.{2})/g,'$1,').split(',').filter(Boolean).map(function (x) {return parseInt(x, 16)})
      return String.fromCharCode.apply(String, m)
    }

    const formattedTransactions: Array<Object> = flow([
      arr => arr.map(transaction => ({
        confirmations: typeof transaction.confirmations !== 'undefined'
          ? transaction.confirmations
          : 0,
        confirmed: typeof transaction.confirmations !== 'undefined'
          ? transaction.confirmations >= MIN_CONFIRMATIONS_NUMBER
          : true,
        transactionId: transaction.txid,
        type: transaction.category,
        date: new Date(transaction.time * 1000).toISOString(),
        fromaddress: transaction.fromaddress || '(Shielded)',
        toaddress: transaction.toaddress || '(Shielded)',
        amount: new BigNumber(transaction.amount).absoluteValue().toNumber(),
        fees: transaction.fee
          ? new BigNumber(transaction.fee).abs().toFormat(4)
          : 'N/A',
        isRead: transaction.isRead,
        memo: transaction.memo
          ? formatMemo(transaction.memo)
          : ''
      })),
      arr => groupBy(arr, obj => dateFns.format(obj.date, 'MMM DD, YYYY')),
      obj => Object.keys(obj).map(day => ({
        day,
        jsDay: new Date(day),
        list: sortByDescend('date')(obj[day]),
      })),
      sortByDescend('jsDay'),
        ])(([...tTxs, ...await zGetZTxsFromStore(10)]
          .sort((a, b) => (a.time < b.time) ? 1 : -1))
          .slice(0, 10));

    if (!zAddresses.length) {
      const [, newZAddress] = await eres(rpc.z_getnewaddress());

      if (newZAddress) zAddresses.push(newZAddress);
    }

    if (!tAddresses.length) {
      const [, newTAddress] = await eres(rpc.getnewaddress(''));

      if (newTAddress) tAddresses.push(newTAddress);
    }

    dispatch(
      loadWalletSummarySuccess({
        transparent: walletSummary.transparent,
        total: walletSummary.total,
        shielded: walletSummary.private,
        unconfirmed: unconfirmedBalance,
        addresses: [...zAddresses, ...tAddresses],
        transactions: formattedTransactions,
        anonPrice: new BigNumber(store.get('ANON_DOLLAR_PRICE')).toNumber(),
      }),
    );
  },
});

// $FlowFixMe
export const DashboardContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardView);
