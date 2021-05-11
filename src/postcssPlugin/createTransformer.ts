import type * as postcss from 'postcss';
import type {PluginConfiguration, EsifyCSSResult} from './types';
import {transformDeclarations} from './transformDeclarations';
import {getImports} from './getImports';
import {minify} from './minify';
import {mangleIdentifiers} from './mangleIdentifiers';
import {mangleKeyFrames} from './mangleKeyFrames';
import {removeImportsAndRaws} from './removeImportsAndRaws';
import {normalizePath} from '../util/normalizePath';

export const createTransformer = (
    {mangler, rawPrefix}: PluginConfiguration,
) => async (
    root: postcss.Root,
    result: postcss.Result,
): Promise<EsifyCSSResult> => {
    const id = normalizePath(result.opts.from || Date.now().toString(36));
    const imports = getImports(root, id);
    const transformResult: EsifyCSSResult = {
        ...(await mangleIdentifiers({id, root, mangler, imports, rawPrefix})),
        keyframes: mangleKeyFrames({id, root, mangler, imports, rawPrefix}),
    };
    transformDeclarations({root, mangler, imports, transformResult, rawPrefix});
    minify(root);
    return removeImportsAndRaws({
        result: transformResult,
        imports,
        rawPrefix,
    });
};
