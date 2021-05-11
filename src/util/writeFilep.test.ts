import * as path from 'path';
import {promises as afs} from 'fs';
import ava from 'ava';
import {createTemporaryDirectory} from './createTemporaryDirectory';
import {writeFilep} from './writeFilep';

ava('create a file', async (t) => {
    const testDirectory = await createTemporaryDirectory();
    const filePath = path.join(testDirectory, 'file');
    await writeFilep(filePath, filePath);
    t.is(await afs.readFile(filePath, 'utf8'), filePath);
});

ava('create a directory and a file', async (t) => {
    const testDirectory = await createTemporaryDirectory();
    const filePath = path.join(testDirectory, 'dir', 'file');
    await writeFilep(filePath, filePath);
    t.is(await afs.readFile(filePath, 'utf8'), filePath);
});
