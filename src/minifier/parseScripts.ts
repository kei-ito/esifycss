import * as fs from 'fs';
import type {ParseScriptsResult, ScriptData} from './types';
import {parseCSSModuleScript} from './parseCSSModuleScript';
import {tokenizeString} from '../util/tokenizeString';
const {readFile} = fs.promises;

export const parseScripts = async (
    {files, cssKey}: {
        files: Array<string>,
        cssKey: string,
    },
): Promise<ParseScriptsResult> => {
    const scripts = new Map<string, ScriptData>();
    const tokens = new Map<string, number>();
    await Promise.all(files.map(async (file) => {
        const code = await readFile(file, 'utf8');
        const data = parseCSSModuleScript({
            code,
            cssKey,
        });
        for (const {css} of data.ranges) {
            for (const token of tokenizeString(css)) {
                tokens.set(token, (tokens.get(token) || 0) + 1);
            }
        }
        scripts.set(file, {...data, script: code});
    }));
    return {scripts, tokens};
};
