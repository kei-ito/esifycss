import type {WatchOptions} from 'chokidar';
import type {SessionOptions, ReadonlyWatchOptions} from './types';
import {ensureArray} from '../util/ensureArray';

export const getChokidarOptions = (
    parameters: SessionOptions,
): ReadonlyWatchOptions => {
    const options: WatchOptions = {
        ...parameters.chokidar,
        ignoreInitial: false,
        alwaysStat: true,
    };
    const ignored = [
        ...ensureArray(parameters.chokidar && parameters.chokidar.ignored),
        ...ensureArray(parameters.exclude),
    ];
    if (0 < ignored.length) {
        options.ignored = ignored;
    }
    return options;
};
