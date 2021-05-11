import type {CSSRange} from './types';
import type {IdGenerator} from '../util/createIdGenerator';
import {encodeString} from '../util/encodeString';

export const minifyCSSInScript = (
    script: string,
    cssRanges: Array<CSSRange>,
    idGenerator: IdGenerator,
): string => {
    let minified = script;
    for (let index = cssRanges.length; index--;) {
        const range = cssRanges[index];
        minified = [
            minified.slice(0, range.start),
            JSON.stringify(encodeString(range.css, idGenerator)),
            minified.slice(range.end),
        ].join('');
    }
    return minified;
};
