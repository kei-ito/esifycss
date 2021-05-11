import type * as postcss from 'postcss';
import type {EsifyCSSResult} from '../postcssPlugin/types';
import {PluginName} from '../postcssPlugin/plugin';

export const extractPluginResult = (
    postcssResult: postcss.Result,
): EsifyCSSResult => {
    const pluginResult: EsifyCSSResult = {
        className: {},
        id: {},
        keyframes: {},
    };
    for (const warning of postcssResult.warnings()) {
        if (warning.plugin === PluginName) {
            const result = JSON.parse(warning.text) as EsifyCSSResult;
            Object.assign(pluginResult.className, result.className);
            Object.assign(pluginResult.id, result.id);
            Object.assign(pluginResult.keyframes, result.keyframes);
        }
    }
    return pluginResult;
};
