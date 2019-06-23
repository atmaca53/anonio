// @flow

import React, { Fragment } from 'react';
import styled from 'styled-components';

import { TransactionItemComponent, type Transaction } from './transaction-item';
import { TextComponent } from './text';

const Wrapper = styled.div`
  margin-top: 20px;
`;

const TransactionsWrapper = styled.div`
  border-radius: ${props => props.theme.boxBorderRadius};
  overflow: hidden;
  background-color: ${props => props.theme.colors.cardBackgroundColor};
  padding: 0;
  margin: 0;
  box-sizing: border-box;
`;

const Day = styled(TextComponent)`
  text-transform: uppercase;
  color: ${props => props.theme.colors.transactionsDate};
  font-size: ${props => `${props.theme.fontSize.regular * 0.9}em`};
  font-weight: ${props => String(props.theme.fontWeight.bold)};
  margin-bottom: 5px;
`;

type Props = {
  transactionsDate: string,
  transactions: Transaction[],
  anonPrice: number,
};

export const TransactionDailyComponent = ({ transactionsDate, transactions, anonPrice }: Props) => (
  <Wrapper data-testid='TransactionsDaily'>
    <Day value={transactionsDate} />
    <TransactionsWrapper>
      {transactions.map(
        ({
          date, type, fromaddress, toaddress, amount, transactionId, confirmed, confirmations, memo
        }) => (
          <Fragment key={`${fromaddress}-${type}-${amount}-${date}`}>
            <TransactionItemComponent
              confirmations={confirmations}
              confirmed={confirmed}
              transactionId={transactionId}
              type={type}
              date={date}
              fromaddress={fromaddress || 'N/A'}
              toaddress={toaddress || 'N/A'}
              amount={amount}
              anonPrice={anonPrice}
              memo={memo}
            />
          </Fragment>
        ),
      )}
    </TransactionsWrapper>
  </Wrapper>
);
