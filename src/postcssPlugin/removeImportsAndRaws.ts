import type {Imports, EsifyCSSResult, IdentifierMap} from './types';
import {getMatchedImport} from './getMatchedImport';

export const removeImportsAndRaws = (
    {result: maps, imports, rawPrefix}: {
        result: EsifyCSSResult,
        imports: Imports,
        rawPrefix: string,
    },
): EsifyCSSResult => {
    const isLocalTransformedIdentifier = (key: string): boolean => {
        return !key.startsWith(rawPrefix) && !getMatchedImport(key, imports);
    };
    const filter = (map: IdentifierMap): IdentifierMap => Object.keys(map)
    .filter(isLocalTransformedIdentifier)
    .reduce<IdentifierMap>(
        (result, key) => {
            result[key] = map[key];
            return result;
        },
        {},
    );
    return {
        className: filter(maps.className),
        id: filter(maps.id),
        keyframes: filter(maps.keyframes),
    };
};
