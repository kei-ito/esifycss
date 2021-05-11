import type {SessionConfiguration, SessionOptions} from './types';
import {plugin} from '../postcssPlugin/plugin';
import {ensureArray} from '../util/ensureArray';
import {getChokidarOptions} from './getChokidarOptions';
import {getOutputOption} from './getOutputOption';
import {getExtensionOption} from './getExtensionOption';
import {getIncludePatterns} from './getIncludePatterns';

export const getSessionConfiguration = (
    parameters: SessionOptions,
): SessionConfiguration => {
    const include = getIncludePatterns({
        include: ensureArray(parameters.include || '*'),
        extensions: parameters.extensions || ['.css'],
    });
    const output = getOutputOption(parameters, include);
    return {
        watch: Boolean(parameters.watch),
        output,
        path: include,
        ext: getExtensionOption(parameters, output),
        chokidar: getChokidarOptions(parameters),
        stdout: parameters.stdout || process.stdout,
        stderr: parameters.stderr || process.stderr,
        postcssPlugins: [
            ...ensureArray(parameters.postcssPlugins),
            plugin(parameters.esifycssPluginParameter || {}),
        ],
        postcssOptions: parameters.postcssOptions || {},
        cssKey: '$$esifycss',
    };
};
