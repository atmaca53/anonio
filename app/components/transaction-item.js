// @flow

import React from 'react';
import styled, { withTheme } from 'styled-components';
import dateFns from 'date-fns';

import { DARK } from '../constants/themes';

import ReceivedIconDark from '../assets/images/transaction_received_icon_dark.svg';
import ReceivedIconLight from '../assets/images/transaction_received_icon_light.svg';
import SentIconLight from '../assets/images/transaction_sent_icon_light.svg';
import SentIconDark from '../assets/images/transaction_sent_icon_dark.svg';
import PendingIconDark from '../assets/images/transaction_pending_icon_dark.svg';
import MemoReadRcvIconLight from '../assets/images/transaction_memo_read_rcv_light.svg';
import MemoReadRcvIconDark from '../assets/images/transaction_memo_read_rcv_dark.svg';
import MemoReadSndIconLight from '../assets/images/transaction_memo_read_snd_light.svg';
import MemoReadSndIconDark from '../assets/images/transaction_memo_read_snd_dark.svg';
import MemoUnreadRcvIconLight from '../assets/images/transaction_memo_unread_rcv_light.svg';
import MemoUnreadRcvIconDark from '../assets/images/transaction_memo_unread_rcv_dark.svg';
import MemoUnreadSndIconLight from '../assets/images/transaction_memo_unread_snd_light.svg';
import MemoUnreadSndIconDark from '../assets/images/transaction_memo_unread_snd_dark.svg';
import UnconfirmedLight from '../assets/images/unconfirmed_light.svg';
import UnconfirmedDark from '../assets/images/unconfirmed_dark.svg';

import { RowComponent } from './row';
import { ColumnComponent } from './column';
import { TextComponent } from './text';
import { ModalComponent } from './modal';
import { TransactionDetailsComponent } from './transaction-details';

import { formatNumber } from '../utils/format-number';
import { getCoinName } from '../utils/get-coin-name';

import electronStore from '../../config/electron-store';
import { MAINNET, TESTNET } from '../../app/constants/anon-network';
import { isTestnet } from '../../config/is-testnet';

const getStoreKey = () => `SHIELDED_TRANSACTIONS_${isTestnet() ? TESTNET : MAINNET}`;
const STORE_KEY = getStoreKey();

const Wrapper = styled(RowComponent)`
  background-color: ${props => props.theme.colors.transactionItemBg};
  padding: 15px 17px;
  cursor: pointer;
  border: 1px solid ${props => props.theme.colors.transactionItemBorder};
  border-bottom: none;
  width: 100%;

  &:last-child {
    border-bottom: 1px solid ${props => props.theme.colors.transactionItemBorder};
  }

  &:hover {
    background-color: ${props => props.theme.colors.transactionItemHoverBg};
  }
`;

const RowWrapper = styled(RowComponent)`
  background-color: ${props => props.theme.colors.transactionItemBg};
  min-width: 0px;
  flex: 1;
  }
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

/* eslint-disable max-len */
const TransactionTypeLabel = styled(TextComponent)`
  text-transform: capitalize;
`;
/* eslint-enable max-len */

const TransactionAddress = styled(TextComponent)`
  color: ${props => props.theme.colors.transactionItemAddress};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 1rem;

  ${String(Wrapper)}:hover & {
    color: ${props => props.theme.colors.transactionItemAddressHover};
  }
`;

const TransactionLabel = styled(TextComponent)`
  color: ${props => props.theme.colors.transactionLabelText};
  white-space: nowrap;

  ${String(Wrapper)}:hover & {
    color: ${props => props.theme.colors.transactionLabelTextHovered};
  }
`;

const TransactionAmounts = styled(TextComponent)`
  white-space:nowrap
`;

const TransactionColumn = styled(ColumnComponent)`
  margin-left: 5px;
  min-width: 0px;
`;

const UnconfirmedStatusWrapper = styled.div`
  right: 30px;
  position: absolute;
`;

const UnconfirmedStatus = styled.img`
  width: 20px;
  height: 20px;
  opacity: 0.6;

  ${String(Wrapper)}:hover & {
    opacity: 1;
  }
`;

const RelativeRowComponent = styled(RowComponent)`
  position: relative;
`;

export type Transaction = {
  confirmed: boolean,
  confirmations: number,
  type: 'send' | 'receive',
  date: string,
  fromaddress: string,
  toaddress: String,
  amount: number,
  anonPrice: number,
  transactionId: string,
  theme: AppTheme,
  isRead: Boolean,
  memo: string,
};

const Component = ({
  confirmed,
  confirmations,
  type,
  date,
  fromaddress,
  toaddress,
  amount,
  anonPrice,
  transactionId,
  theme,
  isRead,
  memo,
}: Transaction) => {
  const coinName = getCoinName();

  const isReceived = type === 'receive';
  const isImmature = type === 'immature';
  const isGenerate = type === 'generate';
  const isSent = type === 'sent';
  const isIncoming = isReceived || isImmature || isGenerate;

  const transactionTime = dateFns.format(new Date(date), 'HH:mm A');
  const transactionValueInAnon = formatNumber({
    value: amount,
    append: `${isIncoming ? '+' : '-'}${coinName} `,
  });
  const transactionValueInUsd = formatNumber({
    value: amount * anonPrice,
    append: `${isIncoming ? '+' : '-'}USD $`,
  });

  const receivedIcon = theme.mode === DARK ? ReceivedIconDark : ReceivedIconLight;
  const sentIcon = theme.mode === DARK ? SentIconDark : SentIconLight;
  const pendingIcon = theme.mode === DARK ? PendingIconDark : PendingIconDark;
  const unconfirmedIcon = theme.mode === DARK ? UnconfirmedLight : UnconfirmedDark;

  // TODO: style the tooltip correctly (overlay issue)
  // const showUnconfirmed = !confirmed || confirmations < 1 || address === '(Shielded)';
  const showUnconfirmed = false;

  const getIconSrc = (state) => {
    if (memo) return (state==='send')
      ? isRead //send
        ? (theme.mode === DARK)
          ? MemoReadSndIconDark
          : MemoReadSndIconLight
        : (theme.mode === DARK)
          ? MemoUnreadSndIconDark
          : MemoUnreadSndIconLight
      : isRead //receive
        ? (theme.mode === DARK)
          ? MemoReadRcvIconDark
          : MemoReadRcvIconLight
        : (theme.mode === DARK)
          ? MemoUnreadRcvIconDark
          : MemoUnreadRcvIconLight

    return (
      {
        receive:  receivedIcon,
        generate: ReceivedIconDark,
        send:     sentIcon,
        immature: PendingIconDark,
      }[state]
    );
  }

  const getTextColor = (state) => {
    return (
      {
        receive:  theme.colors.transactionReceived,
        generate: theme.colors.transactionReceived,
        send:     theme.colors.transactionSent,
        immature: theme.colors.transactionPending
      }[state]
    );
  }

  return (
    <ModalComponent
      renderTrigger={toggleVisibility => (
        <Wrapper
          id={`transaction-item-${transactionId}`}
          alignItems='center'
          justifyContent='space-between'
          onClick={toggleVisibility}
        >
          <RowWrapper alignItems='center'>
            <RelativeRowComponent alignItems='center'>
              <Icon src={getIconSrc(type)} alt='Transaction Type Icon' />
              <TransactionColumn>
                <TransactionTypeLabel isReceived={isReceived} value={type} isBold color={getTextColor(type)}/>
                <TransactionLabel value={transactionTime} isReceived={isReceived} />
              </TransactionColumn>
              {showUnconfirmed && (
                <UnconfirmedStatusWrapper>
                  <UnconfirmedStatus src={unconfirmedIcon} />
                </UnconfirmedStatusWrapper>
              )}
            </RelativeRowComponent>
            <TransactionAddress value={toaddress} />
          </RowWrapper>
          <TransactionColumn alignItems='flex-end'>
            <TransactionAmounts
              isBold
              value={transactionValueInAnon}
              color={getTextColor(type)}
            />
            <TransactionLabel value={transactionValueInUsd} />
          </TransactionColumn>
        </Wrapper>
      )}
    >
      {toggleVisibility => (
        <TransactionDetailsComponent
          amount={amount}
          date={date}
          fromaddress={fromaddress}
          toaddress={toaddress}
          confirmed={confirmed}
          confirmations={confirmations}
          transactionId={transactionId}
          handleClose={toggleVisibility}
          type={type}
          anonPrice={anonPrice}
          memo={memo}
        />
      )}
    </ModalComponent>
  );
};

export const TransactionItemComponent = withTheme(Component);
