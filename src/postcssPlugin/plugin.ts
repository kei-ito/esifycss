import type {Plugin} from 'postcss';
import type {PluginOptions} from './types';
import {getPluginConfiguration} from './getPluginConfiguration';
import {createTransformer} from './createTransformer';

export const PluginName = 'esifycss';

/**
 * PostCSS plugin for EsifyCSS
 */
export const plugin = Object.assign(
    (
        props?: PluginOptions,
    ): Plugin => {
        const transform = createTransformer(getPluginConfiguration(props));
        return {
            postcssPlugin: PluginName,
            Root: async (root, {result}) => {
                result.warn(JSON.stringify(await transform(root, result)));
            },
        };
    },
    {postcss: true},
);
