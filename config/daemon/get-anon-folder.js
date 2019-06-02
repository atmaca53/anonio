// @flow
import os from 'os';
import path from 'path';
import electron from 'electron'; // eslint-disable-line

export const getAnonFolder = () => {
  const { app } = electron;

  if (os.platform() === 'darwin') {
    return path.join(app.getPath('appData'), 'Anon');
  }

  if (os.platform() === 'linux') {
    return path.join(app.getPath('home'), '.anon');
  }

  return path.join(app.getPath('appData'), 'Anon');
};
