// @flow
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import eres from 'eres';

import { getAnonFolder } from './get-anon-folder';

const ANON_LOCK_FILE = '.lock';

export const checkLockFile = async (anonPath?: string) => {
  try {
    const myPath = anonPath || getAnonFolder();
    const [cannotAccess] = await eres(promisify(fs.access)(path.join(myPath, ANON_LOCK_FILE)));
    return !cannotAccess;
  } catch (err) {
    return false;
  }
};
