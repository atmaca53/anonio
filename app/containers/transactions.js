// @flow

import eres from 'eres';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';

import { TransactionsView } from '../views/transactions';
import {
  loadTransactions,
  loadTransactionsSuccess,
  loadTransactionsError,
  resetTransactionsList,
} from '../redux/modules/transactions';
import rpc from '../../services/api';
import { listShieldedTransactions } from '../../services/shielded-transactions';
import store from '../../config/electron-store';
import { MIN_CONFIRMATIONS_NUMBER } from '../constants/anon-network';

import { sortByDescend } from '../utils/sort-by-descend';

import type { AppState } from '../types/app-state';
import type { Dispatch } from '../types/redux';
import type { Transaction } from '../components/transaction-item';

const mapStateToProps = ({ transactions }: AppState) => ({
  transactions: transactions.list,
  isLoading: transactions.isLoading,
  error: transactions.error,
  anonPrice: transactions.anonPrice,
  hasNextPage: transactions.hasNextPage,
});

export type MapStateToProps = {
  transactions: Transaction[],
  isLoading: boolean,
  error: string | null,
  anonPrice: number,
  hasNextPage: boolean,
};

export type MapDispatchToProps = {|
  getTransactions: ({
    offset: number,
    count: number,
    shieldedTransactionsCount: number,
  }) => Promise<void>,
  resetTransactionsList: () => void,
|};

const mapDispatchToProps = (dispatch: Dispatch): MapDispatchToProps => ({
  resetTransactionsList: () => dispatch(resetTransactionsList()),
  getTransactions: async ({ offset, count, shieldedTransactionsCount }) => {
    dispatch(loadTransactions());

    const [transactionsErr, transactions = []] = await eres(
      rpc.listtransactions('', 100, offset),
    );

    if (transactionsErr) {
      return dispatch(loadTransactionsError({ error: transactionsErr.message }));
    }

    const arrTransparentTxs = transactions.filter(t => t.category === 'receive' || t.category === 'send').map(e => {return {
      confirmations: e.confirmations,
      txid: e.txid,
      category: e.category,
      time: e.time,
      toaddress: e.address,
      amount: e.amount,
    }})

    const formatMemo = (m) => {
      m = m.replace(/[0]+$/,'')
      if (m === "f6") return ''
      m = m.replace(/(.{2})/g,'$1,').split(',').filter(Boolean).map(function (x) {return parseInt(x, 16)})
      return String.fromCharCode.apply(String, m)
    }

    const formatFromAddress = (a, m) => {
      m = m.replace(/[0]+$/,'')
      if (m === "f6") return ''
      m = m.replace(/(.{2})/g,'$1,').split(',').filter(Boolean).map(function (x) {return parseInt(x, 16)})
      if (String.fromCharCode.apply(String, m).match(/^(zt)/)){ return String.fromCharCode.apply(String, m) }
      return a
    }

    const formattedTransactions = sortByDescend('date')(
      [
        ...arrTransparentTxs,
        ...await listShieldedTransactions(),
      ].map(transaction => ({
        confirmations: transaction.confirmations !== undefined
          ? transaction.confirmations
          : 0,
        confirmed: transaction.confirmations !== undefined
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
    );

    dispatch(
      loadTransactionsSuccess({
        list: formattedTransactions,
        anonPrice: new BigNumber(store.get('ANON_DOLLAR_PRICE')).toNumber(),
        hasNextPage: Boolean(formattedTransactions.length),
      }),
    );
  },
});

// $FlowFixMe
export const TransactionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TransactionsView);
