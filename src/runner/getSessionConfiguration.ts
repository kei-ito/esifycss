import * as path from 'path';
import {ISessionConfiguration, ISessionOptions, IReadonlyWatchOptions} from './types';
import {plugin} from '../postcssPlugin/plugin';
import {ensureArray} from '../util/ensureArray';
import {getHash} from '../util/getHash';

export const getChokidarOptions = (
    parameters: ISessionOptions,
): IReadonlyWatchOptions => ({
    useFsEvents: false,
    ...parameters.chokidar,
    ignored: [
        ...ensureArray(parameters.chokidar && parameters.chokidar.ignored),
        ...ensureArray(parameters.exclude),
    ],
    ignoreInitial: false,
});

export const getSessionConfiguration = (
    parameters: ISessionOptions,
): ISessionConfiguration => {
    const include = ensureArray(parameters.include || '*');
    const extensions = new Set(parameters.extensions || ['.css']);
    const helper = parameters.helper || `helper.${getHash(include.join(','))}.css.js`;
    if (!path.extname(helper)) {
        throw new Error(`helper should have an extension (e.g. ".js", ".ts"): ${helper}`);
    }
    return {
        watch: Boolean(parameters.watch),
        helper,
        extensions,
        ext: path.extname(helper),
        path: include,
        chokidar: getChokidarOptions(parameters),
        stdout: parameters.stdout || process.stdout,
        stderr: parameters.stderr || process.stderr,
        postcssPlugins: [
            ...ensureArray(parameters.postcssPlugins),
            plugin(parameters.esifycssPluginParameter || {}),
        ],
        postcssOptions: parameters.postcssOptions || {},
    };
};
