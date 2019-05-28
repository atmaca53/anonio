// @flow

import electronStore from './electron-store';
import { ANON_NETWORK, MAINNET } from '../app/constants/anon-network';

export const isTestnet = () => electronStore.get(ANON_NETWORK) !== MAINNET;
