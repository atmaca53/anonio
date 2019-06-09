// @flow

import { isTestnet } from '../../config/is-testnet';

export const ANON_EXPLORER_BASE_URL = isTestnet()
  ? 'http://testnet.anon.community:3001/tx/'
  : 'https://zcha.in/transactions/';
