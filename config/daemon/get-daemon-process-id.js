// @flow
import fs from 'fs';
import path from 'path';
import { getAnonFolder } from './get-anon-folder';

const ANON_PID_FILE = 'anond.pid';

export const getDaemonProcessId = (anonPath?: string) => {
  try {
    const myPath = anonPath || getAnonFolder();
    const buffer = fs.readFileSync(path.join(myPath, ANON_PID_FILE));
    const pid = Number(buffer.toString().trim());
    return pid;
  } catch (err) {
    return null;
  }
};
