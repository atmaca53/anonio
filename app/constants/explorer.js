// @flow

import { isTestnet } from '../../config/is-testnet';

export const ANON_EXPLORER_BASE_URL = isTestnet()
  ? 'https://chain.so/tx/ANONTEST/'
  : 'https://zcha.in/transactions/';
