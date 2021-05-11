import type {SessionConfiguration, SessionOutput} from './types';
import {getBase64UrlHash} from '../util/getBase64UrlHash';

export const getOutputOption = (
    {helper, css}: {helper?: string, css?: string},
    include: Array<string>,
): SessionConfiguration['output'] => {
    let output: SessionOutput | undefined;
    if (css) {
        if (helper) {
            throw new Error(`You can't use options.helper (${helper}) with options.css (${css})`);
        }
        output = {type: 'css', path: css};
    } else {
        const scriptPath = helper || `helper.${getBase64UrlHash(...include)}.css.js`;
        output = {type: 'script', path: scriptPath};
    }
    return output;
};
