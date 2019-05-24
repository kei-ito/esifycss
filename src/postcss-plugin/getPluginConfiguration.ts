import {
    IPluginParameter,
    IPluginConfiguration,
    IPluginMangler,
} from './types';
import {createIdentifier} from './createIdentifier';

export const getPluginMangler = (
    {
        mangle = false,
        identifier = createIdentifier(),
    }: IPluginParameter,
): IPluginMangler => {
    if (mangle) {
        return (id, type, name) => `_${identifier(`${id}-${type}-${name}`).toString(36)}`;
    } else {
        return (id, type, name) => `${id}-${type}-${name}`
        .replace(/[^\w]/g, (c) => `_${c.codePointAt(0)}`);
    }
};

export const getPluginConfiguration = (
    parameters: IPluginParameter = {},
): IPluginConfiguration => ({
    mangler: parameters.mangler || getPluginMangler(parameters),
});