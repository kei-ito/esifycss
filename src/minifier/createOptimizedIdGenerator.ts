import type {IdGenerator} from '../util/createIdGenerator';
import {createIdentifier} from '../util/createIdGenerator';

export const createOptimizedIdGenerator = (tokens: Map<string, number>): IdGenerator => {
    const identifier = createIdentifier();
    for (const [token] of [...tokens].sort((a, b) => b[1] - a[1])) {
        identifier(token);
    }
    return identifier;
};
