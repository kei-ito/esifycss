import type * as postcss from 'postcss';
import type {IPluginConfiguration, IEsifyCSSResult} from './types';
import {transformDeclarations} from './transformDeclarations';
import {getImports} from './getImports';
import {minify} from './minify';
import {mangleIdentifiers} from './mangleIdentifiers';
import {mangleKeyFrames} from './mangleKeyFrames';
import {removeImportsAndRaws} from './removeImportsAndRaws';
import {normalizePath} from '../util/normalizePath';

export const createTransformer = (
    {mangler, rawPrefix}: IPluginConfiguration,
) => async (
    root: postcss.Root,
    result: postcss.Result,
): Promise<IEsifyCSSResult> => {
    const id = normalizePath(result.opts.from || Date.now().toString(36));
    const imports = getImports(root, id);
    const transformResult: IEsifyCSSResult = {
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
