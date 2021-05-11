import type {
    PluginOptions,
    PluginConfiguration,
    PluginMangler,
} from './types';
import {createIdentifier} from '../util/createIdGenerator';

export const getPluginMangler = (
    {
        mangle = true,
        identifier = createIdentifier(),
    }: PluginOptions,
): PluginMangler => {
    if (mangle) {
        return (id, type, name) => `_${identifier(`${id}-${type}-${name}`).toString(36)}`;
    } else {
        return (id, type, name) => `${name}_${identifier(`${id}-${type}-${name}`).toString(36)}`;
    }
};

export const getPluginConfiguration = (
    parameters: PluginOptions = {},
): PluginConfiguration => ({
    mangler: parameters.mangler || getPluginMangler(parameters),
    rawPrefix: parameters.rawPrefix || 'raw-',
});
