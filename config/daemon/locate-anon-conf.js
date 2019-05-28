// @flow

import path from 'path';
import os from 'os';

import { app } from '../electron'; // eslint-disable-line

export const locateAnonConf = () => {
  if (os.platform() === 'darwin') {
    return path.join(app.getPath('appData'), 'Anon', 'anon.conf');
  }

  if (os.platform() === 'linux') {
    return path.join(app.getPath('home'), '.anon', 'anon.conf');
  }

  return path.join(app.getPath('appData'), 'Anon', 'anon.conf');
};
