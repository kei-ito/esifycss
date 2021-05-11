import * as path from 'path';
import {promises as afs} from 'fs';

export const writeFilep = async (filePath: string, data: Uint8Array | string): Promise<void> => {
    await afs.mkdir(path.dirname(filePath), {recursive: true});
    await afs.writeFile(filePath, data);
};
