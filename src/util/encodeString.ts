import type {IdGenerator} from './createIdGenerator';
import {tokenizeString} from './tokenizeString';
import * as vlq from 'vlq';

export const encodeString = (
    string: string,
    idGenerator: IdGenerator,
): string => {
    const encoded: Array<number> = [];
    for (const token of tokenizeString(string)) {
        encoded.push(idGenerator(token));
    }
    return vlq.encode(encoded);
};

export const decodeString = (
    encoded: string,
    words: Array<string>,
): string => vlq.decode(encoded).map((index) => words[index]).join('');
