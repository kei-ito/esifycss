import type {Imports} from './types';
import {normalizePath} from '../util/normalizePath';

export const getMatchedImport = (
    value: string,
    imports: Imports,
): {key: string, from: string} | null => {
    const normalized = normalizePath(value);
    for (const [name, from] of imports) {
        if (normalized.startsWith(name)) {
            return {key: normalized.slice(name.length), from};
        }
    }
    return null;
};
