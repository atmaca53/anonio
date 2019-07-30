// @flow

import { connect } from 'react-redux';
import eres from 'eres';
import { BigNumber } from 'bignumber.js';
import axios from 'axios'

import { updateNodeSyncStatus } from '../redux/modules/app';
import { StatusPill } from '../components/status-pill';
import rpc from '../../services/api';
import { NODE_SYNC_TYPES } from '../constants/node-sync-types';

import type { Dispatch } from '../types/redux';
import type { AppState } from '../types/app-state';

export type MapStateToProps = {|
  nodeSyncProgress: number,
  nodeSyncType: 'ready' | 'syncing' | 'error',
|};

const mapStateToProps = ({ app }: AppState): MapStateToProps => ({
  nodeSyncProgress: app.nodeSyncProgress,
  nodeSyncType: app.nodeSyncType,
});

export type MapDispatchToProps = {|
  getBlockchainStatus: () => Promise<void>,
|};

const mapDispatchToProps = (dispatch: Dispatch): MapDispatchToProps => ({
  getBlockchainStatus: async () => {
    const [blockchainErr, blockchaininfo] = await eres(rpc.getblockchaininfo());

    if (blockchainErr || !blockchaininfo) {
      return dispatch(
        updateNodeSyncStatus({
          nodeSyncProgress: 0,
          nodeSyncType: NODE_SYNC_TYPES.ERROR,
        }),
      );
    }

    let currentHeight
    try {
      const api = await axios.get('https://api.anon.community/getinfo');
      // const api = { data: { blocks: 62309 }}
      currentHeight = api.data.blocks
    } catch (error) {
      console.error(error);
    }

    const newProgress = blockchaininfo.verificationprogress * 100;

    dispatch(
      updateNodeSyncStatus({
        nodeSyncProgress: newProgress,
        nodeSyncType: new BigNumber(blockchaininfo.blocks).eq(currentHeight) ||
                      new BigNumber(newProgress).gt(99.49)
          ? NODE_SYNC_TYPES.READY
          : NODE_SYNC_TYPES.SYNCING,
      }),
    );
  },
});

// $FlowFixMe
export const StatusPillContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(StatusPill);
