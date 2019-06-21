import {readFile} from '../util/fs';
import {IParseScriptsResult, IScriptData} from './types';
import {extractCSSFromScript} from './extractCSSFromScript';
import {tokenizeString} from '../util/tokenizeString';

export const parseScripts = async (
    files: Array<string>,
): Promise<IParseScriptsResult> => {
    const scripts = new Map<string, IScriptData>();
    const tokens = new Map<string, number>();
    await Promise.all(files.map(async (file) => {
        const script = (await readFile(file, 'utf8'));
        const cssRanges = extractCSSFromScript(script);
        for (const {css} of cssRanges) {
            for (const token of tokenizeString(css)) {
                tokens.set(token, (tokens.get(token) || 0) + 1);
            }
        }
        scripts.set(file, {script, cssRanges});
    }));
    return {scripts, tokens};
};
