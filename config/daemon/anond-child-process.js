// @flow

import cp from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { app } from 'electron';
/* eslint-disable import/no-extraneous-dependencies */
import isDev from 'electron-is-dev';
import type { ChildProcess } from 'child_process';
import eres from 'eres';
import uuid from 'uuid/v4';
import findProcess from 'find-process';

/* eslint-disable-next-line import/named */
import { mainWindow } from '../electron';
import waitForDaemonClose from './wait-for-daemon-close';
import getBinariesPath from './get-binaries-path';
import getOsFolder from './get-os-folder';
import getDaemonName from './get-daemon-name';
import fetchParams from './run-fetch-params';
import { locateAnonConf } from './locate-anon-conf';
import { log } from './logger';
import store from '../electron-store';
import { parseAnonConf, parseCmdArgs, generateArgsFromConf } from './parse-anon-conf';
import { isTestnet } from '../is-testnet';
import { getDaemonProcessId } from './get-daemon-process-id';
import {
  EMBEDDED_DAEMON,
  ANON_NETWORK,
  TESTNET,
  MAINNET,
} from '../../app/constants/anon-network';

const getWalletFolderPath = () => {
  // const { app } = electron.remote;

  if (os.platform() === 'darwin') {
    return path.join(app.getPath('appData'), 'Anon');
  }

  if (os.platform() === 'linux') {
    return path.join(app.getPath('home'), '.anon');
  }

  return path.join(app.getPath('appData'), 'Anon');
};

const getDaemonOptions = ({
  username, password, useDefaultAnonConf, optionsFromAnonConf,
}) => {
  /*
    -showmetrics
        Show metrics on stdout
    -metricsui
        Set to 1 for a persistent metrics screen, 0 for sequential metrics
        output
    -metricsrefreshtime
        Number of seconds between metrics refreshes
  */

 console.log(getWalletFolderPath())


  const defaultOptions = [
    '-server=1',
    '-showmetrics=1',
    '-metricsui=0',
    '-metricsrefreshtime=1',
    `-exportdir=${getWalletFolderPath()}`,
    `-rpcuser=${username}`,
    `-rpcpassword=${password}`,
    ...(isTestnet() ? ['-testnet', '-addnode=testnet.z.cash'] : ['-addnode=mainnet.z.cash']),
    // Overwriting the settings with values taken from "anon.conf"
    ...optionsFromAnonConf,
  ];

  if (useDefaultAnonConf) defaultOptions.push(`-conf=${locateAnonConf()}`);

  return Array.from(new Set([...defaultOptions, ...optionsFromAnonConf]));
};

let resolved = false;

const ANOND_PROCESS_NAME = getDaemonName();
const DAEMON_PROCESS_PID = 'DAEMON_PROCESS_PID';

let isWindowOpened = false;

const sendToRenderer = (event: string, message: Object, shouldLog: boolean = true) => {
  if (shouldLog) {
    log(message);
  }

  if (isWindowOpened) {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(event, message);
    }
  } else {
    const interval = setInterval(() => {
      if (isWindowOpened) {
        mainWindow.webContents.send(event, message);
        clearInterval(interval);
      }
    }, 1000);
  }
};

// eslint-disable-next-line
const runDaemon: () => Promise<?ChildProcess> = () => new Promise(async (resolve, reject) => {
  mainWindow.webContents.on('dom-ready', () => {
    isWindowOpened = true;
  });
  store.delete('rpcconnect');
  store.delete('rpcport');
  store.delete(DAEMON_PROCESS_PID);

  const processName = path.join(getBinariesPath(), getOsFolder(), ANOND_PROCESS_NAME);
  const isRelaunch = Boolean(process.argv.find(arg => arg === '--relaunch'));

  if (!mainWindow.isDestroyed()) mainWindow.webContents.send('anond-params-download', 'Fetching params...');

  sendToRenderer('anon-daemon-status', {
    error: false,
    status:
        'Downloading network params, this may take some time depending on your connection speed',
  });

  const [err] = await eres(fetchParams());

  if (err) {
    sendToRenderer('anon-daemon-status', {
      error: true,
      status: `Error while fetching params: ${err.message}`,
    });

    return reject(new Error(err));
  }

  sendToRenderer('anon-daemon-status', {
    error: false,
    status: 'Anonio Starting',
  });

  // In case of --relaunch on argv, we need wait to close the old anon daemon
  // a workaround is use a interval to check if there is a old process running
  if (isRelaunch) {
    await waitForDaemonClose(ANOND_PROCESS_NAME);
  }

  // This will parse and save rpcuser and rpcpassword in the store
  let [, optionsFromAnonConf] = await eres(parseAnonConf());

  // if the user has a custom datadir and doesn't have a anon.conf in that folder,
  // we need to use the default anon.conf
  let useDefaultAnonConf = false;

  if (optionsFromAnonConf.datadir) {
    const hasDatadirConf = fs.existsSync(path.join(optionsFromAnonConf.datadir, 'anon.conf'));

    if (hasDatadirConf) {
      optionsFromAnonConf = await parseAnonConf(
        path.join(String(optionsFromAnonConf.datadir), 'anon.conf'),
      );
    } else {
      useDefaultAnonConf = true;
    }
  }

  if (optionsFromAnonConf.rpcconnect) store.set('rpcconnect', optionsFromAnonConf.rpcconnect);
  if (optionsFromAnonConf.rpcport) store.set('rpcport', optionsFromAnonConf.rpcport);
  if (optionsFromAnonConf.rpcuser) store.set('rpcuser', optionsFromAnonConf.rpcuser);
  if (optionsFromAnonConf.rpcpassword) store.set('rpcpassword', optionsFromAnonConf.rpcpassword);

  log('Searching for anond.pid');
  const daemonProcessId = getDaemonProcessId(optionsFromAnonConf.datadir);

  if (daemonProcessId) {
    store.set(EMBEDDED_DAEMON, false);
    log(
      // eslint-disable-next-line
        `A daemon was found running in PID: ${daemonProcessId}. Starting Anonio in external daemon mode.`,
    );

    // Command line args override anon.conf
    const [{ cmd, pid }] = await findProcess('pid', daemonProcessId);

    store.set(DAEMON_PROCESS_PID, pid);

    // We need grab the rpcuser and rpcpassword from either process args or anon.conf
    const {
      rpcuser, rpcpassword, rpcconnect, rpcport, testnet: isTestnetFromCmd,
    } = parseCmdArgs(
      cmd,
    );

    store.set(
      ANON_NETWORK,
      isTestnetFromCmd === '1' || optionsFromAnonConf.testnet === '1' ? TESTNET : MAINNET,
    );

    if (rpcuser) store.set('rpcuser', rpcuser);
    if (rpcpassword) store.set('rpcpassword', rpcpassword);
    if (rpcport) store.set('rpcport', rpcport);
    if (rpcconnect) store.set('rpcconnect', rpcconnect);

    return resolve();
  }

  log(
    "Anonio couldn't find a `anond.pid`, that means there is no instance of anon running on the machine, trying start built-in daemon",
  );

  store.set(EMBEDDED_DAEMON, true);

  if (!isRelaunch) {
    store.set(ANON_NETWORK, optionsFromAnonConf.testnet === '1' ? TESTNET : MAINNET);
  }

  if (!optionsFromAnonConf.rpcuser) store.set('rpcuser', uuid());
  if (!optionsFromAnonConf.rpcpassword) store.set('rpcpassword', uuid());

  const rpcCredentials = {
    username: store.get('rpcuser'),
    password: store.get('rpcpassword'),
  };

  if (isDev) log('Rpc Credentials', rpcCredentials);

  const childProcess = cp.spawn(
    processName,
    getDaemonOptions({
      ...rpcCredentials,
      useDefaultAnonConf,
      optionsFromAnonConf: generateArgsFromConf(optionsFromAnonConf),
    }),
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  store.set(DAEMON_PROCESS_PID, childProcess.pid);

  childProcess.stdout.on('data', (data) => {
    sendToRenderer('anond-log', data.toString(), false);
    if (!resolved) {
      resolve(childProcess);
      resolved = true;
    }
  });

  childProcess.stderr.on('data', (data) => {
    log(data.toString());
    reject(new Error(data.toString()));
  });

  childProcess.on('error', reject);

  if (os.platform() === 'win32') {
    resolved = true;
    resolve(childProcess);
  }
});

// eslint-disable-next-line
export default runDaemon;
