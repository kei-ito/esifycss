#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import * as console from 'console';
import * as commander from 'commander';
import {Session} from '../runner/Session.js';
import {loadParameters} from './loadParameters';

const packageData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')) as {
    version: string,
};

export const program = new commander.Command()
.version(packageData.version)
.arguments('<include...>')
.option('--helper <path>', 'A path where the helper script will be output. You can\'t use --helper with --css.')
.option('--css <path>', 'A path where the css will be output. You can\'t use --css with --helper.')
.option('--ext <ext>', 'An extension of scripts generated from css.')
.option('--config <path>', 'A path to configuration files.')
.option('--exclude <path...>', 'Paths or patterns to be excluded.')
.option('--noMangle', 'Keep the original name for debugging.')
.option('--watch', 'Watch files and update the modules automatically.')
.action(async (include: Array<string>, options) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await new Session(await loadParameters(include, options)).start();
});

if (require.main === module) {
    program.parseAsync().catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
}
